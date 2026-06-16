"use server";

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getAdminPB, getPublicPB } from '@/lib/pocketbase';
import { invalidateCache } from '@/lib/cache';

export async function submitBooking(formData: Record<string, unknown>) {
  try {
    // 1. Honeypot check
    if (typeof formData.hp === 'string' && formData.hp.length > 0) {
      console.warn("Spam detected: Honeypot filled");
      return { success: false, error: "errors.spam" };
    }

    // 2. Timestamp check (anti-bot speed)
    const startTime = parseInt(typeof formData.ts === 'string' ? formData.ts : "0");
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

    const cleanName = sanitizeHTML(typeof formData.full_name === 'string' ? formData.full_name : '').trim();
    const cleanPhone = sanitizeHTML(typeof formData.phone === 'string' ? formData.phone : '').trim();
    const cleanPlate = sanitizeHTML(typeof formData.plate_number === 'string' ? formData.plate_number : '').trim();
    const cleanNotes = sanitizeHTML(typeof formData.notes === 'string' ? formData.notes : '').trim();

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

    // Use ADMIN client for all database operations
    const adminPb = await getAdminPB();

    // Check service requirements (matricule and/or location)
    let requiresLocation = false;
    let requiresMatricule = true; // Default to true (standard car washes)
    if (formData.service_id && typeof formData.service_id === 'string') {
      try {
        const service = await adminPb.collection('services').getOne(formData.service_id);
        requiresLocation = !!service.requires_location;
        requiresMatricule = service.requires_matricule !== undefined ? !!service.requires_matricule : true;
      } catch (err) {
        console.error("Error fetching service to check requirements:", err);
      }
    }

    const cleanLocation = sanitizeHTML(typeof formData.location === 'string' ? formData.location : '').trim();

    if (requiresLocation) {
      if (!cleanLocation || cleanLocation.length > 250) {
        return { success: false, error: "errors.invalidLocation" };
      }
    }

    if (requiresMatricule) {
      if (!cleanPlate || cleanPlate.length > 100) {
        return { success: false, error: "errors.invalidPlate" };
      }
    }

    // 4. Date validation (must not be in the past)
    const bookingDate = new Date(typeof formData.date === 'string' ? formData.date : '');
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

    const data: Record<string, unknown> = {
      full_name: cleanName,
      phone: cleanPhone,
      plate_number: requiresMatricule ? cleanPlate : "",
      location: requiresLocation ? cleanLocation : "",
      service_type: formData.service_type,
      service: formData.service_id || null, // Link to the specific service
      price: formData.price,
      status: "pending", // FORCED server-side — users can never set their own status
      notes: cleanNotes + " (Validated Server Action)",
      date: formData.date,
      created: new Date().toISOString(),
    };

    if (userId) {
      data.user = userId;
      let filterStr = `user = "${userId}" && (status = "pending" || status = "confirmed")`;
      if (data.service) {
        filterStr += ` && service = "${data.service}"`;
      } else {
        filterStr += ` && service_type = "${data.service_type}"`;
      }

      // Check for existing active bookings for this user for the SAME service
      const existingBookings = await adminPb.collection('bookings').getList(1, 1, {
        filter: filterStr,
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
          let filterStr = `(${idsArray.map(id => `id = "${id}"`).join(' || ')}) && (status = "pending" || status = "confirmed")`;
          if (data.service) {
            filterStr += ` && service = "${data.service}"`;
          } else {
            filterStr += ` && service_type = "${data.service_type}"`;
          }

          const existingBookings = await adminPb.collection('bookings').getList(1, 1, { filter: filterStr });
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
    const dateKey = typeof formData.date === 'string' ? formData.date.split('T')[0] : undefined;
    if (dateKey) invalidateCache(`slots:${dateKey}`);

    invalidateCache('bookings:admin:');
    invalidateCache('admin_stats');

    // Force refresh of the bookings page
    revalidatePath('/profile');
    revalidatePath('/my-bookings');
    revalidatePath('/admin');
    revalidatePath('/admin/bookings');

    return { success: true, id: record.id };
  } catch (error: unknown) {
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
          
          // No caching for user bookings as requested
          const adminPb = await getAdminPB();
          const records = await adminPb.collection('bookings').getList(1, 50, {
            filter: `user = "${userId}"`,
            sort: '-created',
          });
          return JSON.parse(JSON.stringify(records.items));
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

    // No caching for guest bookings
    const adminPb = await getAdminPB();
    const records = await adminPb.collection('bookings').getList(1, 50, {
      filter: idsArray.map(id => `id = "${id}"`).join(' || '),
      sort: '-created',
    });
    return JSON.parse(JSON.stringify(records.items));
  } catch (error: unknown) {
    if ((error as Record<string, unknown>)?.status === 403 || (error as Record<string, unknown>)?.status === 400) {
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
    
    invalidateCache('bookings:admin:');
    invalidateCache('admin_stats');

    revalidatePath('/profile');
    revalidatePath('/my-bookings');
    revalidatePath('/admin');
    revalidatePath('/admin/bookings');

    return { success: true };
  } catch (error: unknown) {
    console.error("Error cancelling booking:", error);
    return { success: false, error: "errors.general" };
  }
}

export async function getBookedTimes(dateStr: string, serviceId?: string) {
  try {
    // No caching for booked times as requested
    const start = new Date(`${dateStr}T00:00:00`).toISOString();
    const end = new Date(`${dateStr}T23:59:59`).toISOString();

    const startPb = start.replace('T', ' ');
    const endPb = end.replace('T', ' ');

    let filterStr = `date >= "${startPb}" && date <= "${endPb}" && status != "cancelled"`;
    if (serviceId) {
      filterStr += ` && service = "${serviceId}"`;
    }

    const adminPb = await getAdminPB();
    const records = await adminPb.collection('bookings').getList(1, 100, {
      filter: filterStr,
    });

    return records.items.map(record => record.date);
  } catch (error: unknown) {
    console.error("Error fetching booked times:", error);
    return [];
  }
}
