"use server";

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

async function authenticateAdmin() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  if (!pbAuth) throw new Error("Not authenticated");

  pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);
  if (!pb.authStore.isValid || !pb.authStore.model) throw new Error("Invalid session");

  const user = await pb.collection('users').getOne(pb.authStore.model.id);
  if (user.role !== 'admin') throw new Error("Forbidden: Admin access required");
  return user;
}

export async function verifyAdmin() {
  try {
    await authenticateAdmin();
    return { isAdmin: true };
  } catch {
    return { isAdmin: false };
  }
}

export async function getAllBookings(page = 1, perPage = 20, statusFilter = '', searchQuery = '') {
  try {
    await authenticateAdmin();
    const filters: string[] = [];
    if (statusFilter && statusFilter !== 'all') filters.push(`status = "${statusFilter}"`);
    if (searchQuery) {
      const q = searchQuery.replace(/"/g, '\\"');
      filters.push(`(full_name ~ "${q}" || phone ~ "${q}" || plate_number ~ "${q}" || id ~ "${q}")`);
    }
    const filter = filters.join(' && ');

    const records = await pb.collection('bookings').getList(page, perPage, { filter, sort: '-created' });
    return {
      success: true,
      items: JSON.parse(JSON.stringify(records.items)),
      totalItems: records.totalItems,
      totalPages: records.totalPages,
      page: records.page,
    };
  } catch (error: any) {
    console.error("Admin getAllBookings error:", error);
    return { success: false, error: error.message, items: [], totalItems: 0, totalPages: 0, page: 1 };
  }
}

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  try {
    await authenticateAdmin();
    await pb.collection('bookings').update(bookingId, { status: newStatus });
    revalidatePath('/admin');
    revalidatePath('/my-bookings');
    return { success: true };
  } catch (error: any) {
    console.error("Admin updateBookingStatus error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBooking(bookingId: string) {
  try {
    await authenticateAdmin();
    await pb.collection('bookings').delete(bookingId);
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error("Admin deleteBooking error:", error);
    return { success: false, error: error.message };
  }
}

export async function getStats() {
  try {
    await authenticateAdmin();
    const allBookings = await pb.collection('bookings').getList(1, 1, {});
    const pendingBookings = await pb.collection('bookings').getList(1, 1, { filter: 'status = "pending"' });
    const confirmedBookings = await pb.collection('bookings').getList(1, 1, { filter: 'status = "confirmed"' });
    const cancelledBookings = await pb.collection('bookings').getList(1, 1, { filter: 'status = "cancelled"' });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const startPb = todayStart.toISOString().replace('T', ' ');
    const endPb = todayEnd.toISOString().replace('T', ' ');

    const todaysBookings = await pb.collection('bookings').getList(1, 1, {
      filter: `date >= "${startPb}" && date <= "${endPb}" && status != "cancelled"`,
    });

    const revenueBookings = await pb.collection('bookings').getList(1, 500, { filter: 'status != "cancelled"' });
    const totalRevenue = revenueBookings.items.reduce((sum: number, b: any) => sum + (b.price || 0), 0);

    return {
      success: true,
      stats: {
        total: allBookings.totalItems,
        pending: pendingBookings.totalItems,
        confirmed: confirmedBookings.totalItems,
        cancelled: cancelledBookings.totalItems,
        todayCount: todaysBookings.totalItems,
        totalRevenue,
      },
    };
  } catch (error: any) {
    console.error("Admin getStats error:", error);
    return { success: false, error: error.message, stats: null };
  }
}
