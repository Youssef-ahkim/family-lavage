"use server";

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getAdminPB, getPublicPB } from '@/lib/pocketbase';
import { cached, invalidateCache, CACHE_TTL } from '@/lib/cache';

export async function submitBooking(formData: any) {
  try {
    // 1. Honeypot check
    if (formData.hp && formData.hp.length > 0) {
      console.warn("Spam detected: Honeypot filled");
      return { success: false, error: "errors.spam" };
    }

    // 2. Timestamp check (anti-bot speed)
    const startTime = parseInt(formData.ts || "0");
    const currentTime = Date.now();
    if (currentTime - startTime < 3000) { // Less than 3 seconds is suspicious
      console.warn("Spam detected: Too fast");
      return { success: false, error: "errors.tooFast" };
    }

    // 3. Strict Validation & Sanitization
    const sanitizeHTML = (str: string) => {
      if (typeof str !== 'string') return '';
      return str.replace(/[&<>'"]/g,
        tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag] || tag)
      );
    };

    const cleanName = sanitizeHTML(formData.full_name || '').trim();
    const cleanPhone = sanitizeHTML(formData.phone || '').trim();
    const cleanPlate = sanitizeHTML(formData.plate_number || '').trim();
    const cleanNotes = sanitizeHTML(formData.notes || '').trim();

    // Name should not contain numbers or special chars (letters, spaces, hyphens, apostrophes allowed)
    const nameRegex = /^[A-Za-zÀ-ÿ\s\-\']+$/;
    if (!cleanName || !nameRegex.test(cleanName)) {
      return { success: false, error: "errors.invalidName" };
    }

    // Phone should have 8-15 digits, optional + at start
    const numericPhone = cleanPhone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    if (!cleanPhone || !phoneRegex.test(numericPhone)) {
      return { success: false, error: "errors.invalidPhone" };
    }

    if (!cleanPlate || cleanPlate.length > 100) {
      return { success: false, error: "errors.invalidPlate" };
    }

    // 4. Date validation (must not be in the past)
    const bookingDate = new Date(formData.date);
    const now = new Date();
    if (bookingDate < now) {
      return { success: false, error: "errors.pastDate" };
    }

    // 5. Check if user is logged in to link the reservation
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth');
    let userId = null;

    if (pbAuth) {
      try {
        const pb = getPublicPB();
        pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);
        if (pb.authStore.isValid && pb.authStore.model) {
          userId = pb.authStore.model.id;
        }
      } catch (e) {
        console.error("Error reading auth cookie for booking:", e);
      }
    }

    // 6. Use ADMIN client for all database operations
    const adminPb = await getAdminPB();

    const data: any = {
      full_name: cleanName,
      phone: cleanPhone,
      plate_number: cleanPlate,
      service_type: formData.service_type,
      price: formData.price,
      status: "pending", // FORCED server-side — users can never set their own status
      notes: cleanNotes + " (Validated Server Action)",
      date: formData.date,
      created: new Date().toISOString(),
    };

    if (userId) {
      data.user = userId;
      // Check for existing active bookings for this user (skip cache — must be real-time)
      const existingBookings = await adminPb.collection('bookings').getList(1, 1, {
        filter: `user = "${userId}" && (status = "pending" || status = "confirmed")`,
      });
      if (existingBookings.totalItems > 0) {
        return { success: false, error: "errors.alreadyHasBooking" };
      }
    } else {
      // Check for existing active bookings for guest using cookie IDs
      const bookingIds = cookieStore.get('my_bookings')?.value || "";
      if (bookingIds) {
        const idsArray = bookingIds.split(',').filter(id => id.length > 0);
        if (idsArray.length > 0) {
          const filter = `(${idsArray.map(id => `id = "${id}"`).join(' || ')}) && (status = "pending" || status = "confirmed")`;
          const existingBookings = await adminPb.collection('bookings').getList(1, 1, { filter });
          if (existingBookings.totalItems > 0) {
            return { success: false, error: "errors.alreadyHasBooking" };
          }
        }
      }
    }

    const record = await adminPb.collection("bookings").create(data);

    if (!userId) {
      // 7. Store booking ID in cookies for guest persistence ONLY
      const existing = cookieStore.get('my_bookings')?.value || "";
      const updated = existing ? `${existing},${record.id}` : record.id;

      cookieStore.set('my_bookings', updated, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        httpOnly: true,
        secure: process.env.DISABLE_SECURE_COOKIE === 'true' ? false : process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    // Invalidate cached bookings and time slots so fresh data shows immediately
    if (userId) invalidateCache(`bookings:${userId}`);
    invalidateCache('bookings:guest');
    // Invalidate the booked-slots cache for the booking's date
    const dateKey = formData.date?.split('T')[0];
    if (dateKey) invalidateCache(`slots:${dateKey}`);

    // Force refresh of the bookings page
    revalidatePath('/profile');
    revalidatePath('/my-bookings');

    return { success: true, id: record.id };
  } catch (error: any) {
    console.error("Server Action Booking Error:", error);
    return {
      success: false,
      error: "errors.general"
    };
  }
}

export async function getMyBookings(fallbackIds?: string) {
  try {
    const cookieStore = await cookies();
    
    // 1. Check if user is logged in
    const pbAuth = cookieStore.get('pb_auth');
    if (pbAuth) {
      try {
        const pb = getPublicPB();
        pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);
        if (pb.authStore.isValid && pb.authStore.model) {
          const userId = pb.authStore.model.id;
          
          // Cached bookings for authenticated user (30s TTL)
          return await cached(`bookings:${userId}`, CACHE_TTL.BOOKINGS, async () => {
            const adminPb = await getAdminPB();
            const records = await adminPb.collection('bookings').getList(1, 50, {
              filter: `user = "${userId}"`,
              sort: '-created',
            });
            return JSON.parse(JSON.stringify(records.items));
          });
        }
      } catch (e) {
        console.error("Error fetching bookings for authenticated user:", e);
      }
    }

    // 2. Fallback to guest bookings via cookie
    const cookieValue = cookieStore.get('my_bookings');
    const bookingIds = cookieValue?.value || fallbackIds || "";

    if (!bookingIds) {
      return [];
    }

    const idsArray = bookingIds.split(',').filter(id => id.length > 0);
    if (idsArray.length === 0) return [];

    // Cache guest bookings by their ID set (30s TTL)
    const cacheKey = `bookings:guest:${idsArray.sort().join(',')}`;
    return await cached(cacheKey, CACHE_TTL.BOOKINGS, async () => {
      const adminPb = await getAdminPB();
      const records = await adminPb.collection('bookings').getList(1, 50, {
        filter: idsArray.map(id => `id = "${id}"`).join(' || '),
        sort: '-created',
      });
      return JSON.parse(JSON.stringify(records.items));
    });
  } catch (error: any) {
    if (error.status === 403 || error.status === 400) {
      console.warn("PocketBase Permission Error — this should not happen with Admin Proxy. Check PB_ADMIN credentials.");
    }
    console.error("Error fetching my bookings:", error);
    return [];
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const cookieStore = await cookies();
    let authorized = false;
    let userId: string | null = null;

    // Check 1: Is the user logged in and does this booking belong to them?
    const pbAuth = cookieStore.get('pb_auth');
    const adminPb = await getAdminPB();

    if (pbAuth) {
      try {
        const pb = getPublicPB();
        pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);
        if (pb.authStore.isValid && pb.authStore.model) {
          userId = pb.authStore.model.id;
          const booking = await adminPb.collection('bookings').getOne(bookingId);
          if (booking.user === userId) {
            authorized = true;
          }
        }
      } catch (e) {
        console.error("Error verifying user ownership:", e);
      }
    }

    // Check 2: Is this a guest booking tracked via cookie?
    if (!authorized) {
      const bookingIds = cookieStore.get('my_bookings')?.value || "";
      if (bookingIds.split(',').includes(bookingId)) {
        authorized = true;
      }
    }

    if (!authorized) {
      return { success: false, error: "errors.unauthorized" };
    }

    // Use ADMIN client for the actual update
    await adminPb.collection('bookings').update(bookingId, {
      status: 'cancelled',
      notes: 'Customer cancelled via website.'
    });

    // Invalidate bookings cache so the UI reflects the cancellation
    if (userId) invalidateCache(`bookings:${userId}`);
    invalidateCache('bookings:guest');

    return { success: true };
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return { success: false, error: "errors.general" };
  }
}

export async function getBookedTimes(dateStr: string) {
  try {
    // Cached booked slots for this date (30s TTL)
    return await cached(`slots:${dateStr}`, CACHE_TTL.BOOKED_SLOTS, async () => {
      // We fetch bookings for the given date.
      // Date string from client is YYYY-MM-DD.
      // We construct local start and end of day.
      const start = new Date(`${dateStr}T00:00:00`).toISOString();
      const end = new Date(`${dateStr}T23:59:59`).toISOString();

      // PocketBase filters use the format YYYY-MM-DD HH:mm:ss.SSSZ
      const startPb = start.replace('T', ' ');
      const endPb = end.replace('T', ' ');

      // Use ADMIN client
      const adminPb = await getAdminPB();
      const records = await adminPb.collection('bookings').getList(1, 100, {
        filter: `date >= "${startPb}" && date <= "${endPb}" && status != "cancelled"`,
      });

      // Return the raw date strings so the client can parse them accurately
      return records.items.map(record => record.date);
    });
  } catch (error: any) {
    console.error("Error fetching booked times:", error);
    return [];
  }
}
