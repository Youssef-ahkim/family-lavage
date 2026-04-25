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

    // 3. Basic Validation
    if (!formData.full_name || !formData.phone || formData.phone.length < 10) {
      return { success: false, error: "Invalid data provided." };
    }

    // 4. Create record in PocketBase
    const data = {
      full_name: formData.full_name,
      phone: formData.phone,
      plate_number: formData.plate_number,
      service_type: formData.service_type,
      price: formData.price,
      status: "pending",
      notes: formData.notes + " (Validated Server Action)",
      date: formData.date,
    };

    const record = await pb.collection("guest_bookings").create(data);

    // 5. Store booking ID in cookies for persistence
    const cookieStore = await cookies();
    const existing = cookieStore.get('my_bookings')?.value || "";
    const updated = existing ? `${existing},${record.id}` : record.id;
    
    cookieStore.set('my_bookings', updated, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

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
    // Note: If this fails, check PocketBase 'List Rule' for guest_bookings
    const records = await pb.collection('guest_bookings').getList(1, 50, {
      filter: idsArray.map(id => `id = "${id}"`).join(' || '),
      sort: '-created',
    });

    console.log(`Found ${records.items.length} records in PocketBase.`);
    return JSON.parse(JSON.stringify(records.items)); // Plain objects for client
  } catch (error: any) {
    if (error.status === 403 || error.status === 400) {
      console.warn("PocketBase Permission Error: Ensure 'List/View' Rules are set to public for guest_bookings collection.");
    }
    console.error("Error fetching my bookings:", error);
    return [];
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const cookieStore = await cookies();
    const bookingIds = cookieStore.get('my_bookings')?.value || "";
    
    // Security check: ensure the ID belongs to this guest
    if (!bookingIds.split(',').includes(bookingId)) {
      throw new Error("Unauthorized");
    }

    await pb.collection('guest_bookings').update(bookingId, {
      status: 'cancelled',
      notes: 'Customer cancelled via website.'
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return { success: false, error: error.message };
  }
}
