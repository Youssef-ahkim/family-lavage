"use server";

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

export async function submitBooking(formData: any) {
  try {
    // 1. Honeypot check
    if (formData.hp && formData.hp.length > 0) {
      console.warn("Spam detected: Honeypot filled");
      return { success: false, error: "Spam detected." };
    }

    // 2. Timestamp check (anti-bot speed)
    const startTime = parseInt(formData.ts || "0");
    const currentTime = Date.now();
    if (currentTime - startTime < 3000) { // Less than 3 seconds is suspicious
      console.warn("Spam detected: Too fast");
      return { success: false, error: "Submission too fast. Please try again." };
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
      return { success: false, error: "Name must not contain numbers or special characters." };
    }

    // Phone should have 8-15 digits, optional + at start
    const numericPhone = cleanPhone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    if (!cleanPhone || !phoneRegex.test(numericPhone)) {
      return { success: false, error: "Please enter a valid phone number." };
    }

    if (!cleanPlate || cleanPlate.length > 100) {
      return { success: false, error: "Please enter a valid vehicle identifier (max 100 characters)." };
    }

    // 4. Check if user is logged in to link the reservation
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth');
    let userId = null;

    if (pbAuth) {
      try {
        pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);
        if (pb.authStore.isValid && pb.authStore.model) {
          userId = pb.authStore.model.id;
        }
      } catch (e) {
        console.error("Error reading auth cookie for booking:", e);
      }
    }

    // 5. Create record in PocketBase
    const data: any = {
      full_name: cleanName,
      phone: cleanPhone,
      plate_number: cleanPlate,
      service_type: formData.service_type,
      price: formData.price,
      status: "pending",
      notes: cleanNotes + " (Validated Server Action)",
      date: formData.date,
    };

    if (userId) {
      data.user = userId;
    }

    const record = await pb.collection("bookings").create(data);

    if (!userId) {
      // 6. Store booking ID in cookies for guest persistence ONLY
      const existing = cookieStore.get('my_bookings')?.value || "";
      const updated = existing ? `${existing},${record.id}` : record.id;

      cookieStore.set('my_bookings', updated, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    // Force refresh of the bookings page
    revalidatePath('/my-bookings');

    return { success: true, id: record.id };
  } catch (error: any) {
    console.error("Server Action Booking Error:", error);
    return {
      success: false,
      error: error.message || "An error occurred while processing your booking."
    };
  }
}

export async function getMyBookings(fallbackIds?: string) {
  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get('my_bookings');
    const bookingIds = cookieValue?.value || fallbackIds || "";

    console.log("Fetching bookings for IDs:", bookingIds);

    if (!bookingIds) {
      console.log("No booking IDs found in cookie.");
      return [];
    }

    const idsArray = bookingIds.split(',').filter(id => id.length > 0);

    if (idsArray.length === 0) return [];

    // Fetch bookings matching the IDs in the cookie
    // Note: If this fails, check PocketBase 'List Rule' for bookings
    const records = await pb.collection('bookings').getList(1, 50, {
      filter: idsArray.map(id => `id = "${id}"`).join(' || '),
      sort: '-created',
    });

    console.log(`Found ${records.items.length} records in PocketBase.`);
    return JSON.parse(JSON.stringify(records.items)); // Plain objects for client
  } catch (error: any) {
    if (error.status === 403 || error.status === 400) {
      console.warn("PocketBase Permission Error: Ensure 'List/View' Rules are set to public for bookings collection.");
    }
    console.error("Error fetching my bookings:", error);
    return [];
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const cookieStore = await cookies();
    let authorized = false;

    // Check 1: Is the user logged in and does this booking belong to them?
    const pbAuth = cookieStore.get('pb_auth');
    if (pbAuth) {
      try {
        pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);
        if (pb.authStore.isValid && pb.authStore.model) {
          const booking = await pb.collection('bookings').getOne(bookingId);
          if (booking.user === pb.authStore.model.id) {
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
      throw new Error("Unauthorized");
    }

    await pb.collection('bookings').update(bookingId, {
      status: 'cancelled',
      notes: 'Customer cancelled via website.'
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return { success: false, error: error.message };
  }
}

export async function getBookedTimes(dateStr: string) {
  try {
    // We fetch bookings for the given date.
    // Date string from client is YYYY-MM-DD.
    // We construct local start and end of day.
    const start = new Date(`${dateStr}T00:00:00`).toISOString();
    const end = new Date(`${dateStr}T23:59:59`).toISOString();

    // PocketBase filters use the format YYYY-MM-DD HH:mm:ss.SSSZ
    const startPb = start.replace('T', ' ');
    const endPb = end.replace('T', ' ');

    const records = await pb.collection('bookings').getList(1, 100, {
      filter: `date >= "${startPb}" && date <= "${endPb}" && status != "cancelled"`,
    });

    // Return the raw date strings so the client can parse them accurately
    return records.items.map(record => record.date);
  } catch (error: any) {
    console.error("Error fetching booked times:", error);
    return [];
  }
}

