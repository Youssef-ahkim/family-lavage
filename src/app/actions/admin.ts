"use server";

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getAdminPB, getPublicPB } from '@/lib/pocketbase';
import { cached, invalidateCache, CACHE_TTL } from '@/lib/cache';

/**
 * Verifies the current user is an admin by checking their cookie token
 * and then fetching their role via the ADMIN PocketBase client.
 */
async function authenticateAdmin() {
  const cookieStore = await cookies();
  const pbAuth = cookieStore.get('pb_auth');
  if (!pbAuth) throw new Error("Not authenticated");

  const pb = getPublicPB();
  pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);
  if (!pb.authStore.isValid || !pb.authStore.model) throw new Error("Invalid session");

  const userId = pb.authStore.model.id;

  // Cache the admin role check (60s) — avoids a DB hit on every admin action
  const isAdmin = await cached(`admin_check:${userId}`, CACHE_TTL.PROFILE, async () => {
    const adminPb = await getAdminPB();
    const user = await adminPb.collection('users').getOne(userId);
    return user.role === 'admin';
  });

  if (!isAdmin) throw new Error("Forbidden: Admin access required");
  return { id: userId };
}

export async function verifyAdmin() {
  try {
    await authenticateAdmin();
    return { isAdmin: true };
  } catch {
    return { isAdmin: false };
  }
}

export async function getAllBookings(page = 1, perPage = 20, statusFilter = '', searchQuery = '', dateFilter = '') {
  try {
    await authenticateAdmin();
    const adminPb = await getAdminPB();

    const filters: string[] = [];
    if (statusFilter && statusFilter !== 'all') filters.push(`status = "${statusFilter}"`);
    if (searchQuery) {
      const q = searchQuery.replace(/"/g, '\\"');
      filters.push(`(full_name ~ "${q}" || phone ~ "${q}" || plate_number ~ "${q}" || id ~ "${q}")`);
    }
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filters.push(`date >= "${today.toISOString().replace('T', ' ')}" && date < "${tomorrow.toISOString().replace('T', ' ')}"`);
    }
    const filter = filters.join(' && ');

    const records = await adminPb.collection('bookings').getList(page, perPage, { filter, sort: '-created' });
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
    const adminPb = await getAdminPB();
    await adminPb.collection('bookings').update(bookingId, { status: newStatus });
    
    // Invalidate all booking-related caches
    invalidateCache('bookings:');
    invalidateCache('admin_stats');
    
    revalidatePath('/admin');
    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    console.error("Admin updateBookingStatus error:", error.response || error);
    return { success: false, error: error.message, details: error.response };
  }
}

export async function deleteBooking(bookingId: string) {
  try {
    await authenticateAdmin();
    const adminPb = await getAdminPB();
    await adminPb.collection('bookings').delete(bookingId);
    
    // Invalidate all booking-related caches
    invalidateCache('bookings:');
    invalidateCache('admin_stats');
    
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error("Admin deleteBooking error:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllUsers(page = 1, perPage = 20, searchQuery = '') {
  try {
    await authenticateAdmin();
    const adminPb = await getAdminPB();

    const filters: string[] = [];
    if (searchQuery) {
      const q = searchQuery.replace(/"/g, '\\"');
      filters.push(`(name ~ "${q}" || full_name ~ "${q}" || email ~ "${q}" || phone ~ "${q}" || id ~ "${q}")`);
    }
    const filter = filters.join(' && ');

    const options: any = { 
      sort: '-created',
      requestKey: null,
      fetch: (url: string, config: any) => fetch(url, { ...config, cache: 'no-store' })
    };
    if (filter) options.filter = filter;

    const records = await adminPb.collection('users').getList(page, perPage, options);
    return {
      success: true,
      items: JSON.parse(JSON.stringify(records.items)),
      totalItems: records.totalItems,
      totalPages: records.totalPages,
      page: records.page,
    };
  } catch (error: any) {
    console.error("Admin getAllUsers error:", error.response || error);
    return { success: false, error: error.message, details: error.response, items: [], totalItems: 0, totalPages: 0, page: 1 };
  }
}

export async function getStats() {
  try {
    await authenticateAdmin();

    // Cache stats for 30s — dashboard doesn't need to be real-time
    return await cached('admin_stats', CACHE_TTL.ADMIN_STATS, async () => {
      const adminPb = await getAdminPB();

      // Run all stat queries in parallel for maximum speed
      const [allBookings, pendingBookings, confirmedBookings, cancelledBookings, todaysBookings, revenueBookings] =
        await Promise.all([
          adminPb.collection('bookings').getList(1, 1, {}),
          adminPb.collection('bookings').getList(1, 1, { filter: 'status = "pending"' }),
          adminPb.collection('bookings').getList(1, 1, { filter: 'status = "confirmed"' }),
          adminPb.collection('bookings').getList(1, 1, { filter: 'status = "cancelled"' }),
          (() => {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            const startPb = todayStart.toISOString().replace('T', ' ');
            const endPb = todayEnd.toISOString().replace('T', ' ');
            return adminPb.collection('bookings').getList(1, 1, {
              filter: `date >= "${startPb}" && date <= "${endPb}" && status != "cancelled"`,
            });
          })(),
          adminPb.collection('bookings').getList(1, 500, { filter: 'status != "cancelled"' }),
        ]);

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
    });
  } catch (error: any) {
    console.error("Admin getStats error:", error);
    return { success: false, error: error.message, stats: null };
  }
}
