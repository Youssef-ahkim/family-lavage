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

    const cacheKey = `bookings:admin:${page}:${perPage}:${statusFilter}:${searchQuery}:${dateFilter}`;
    const records = await cached(cacheKey, 15 * 1000, async () => {
      return await adminPb.collection('bookings').getList(page, perPage, { filter, sort: '-created' });
    });
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

    // Fetch the booking to check its properties before updating
    const booking = await adminPb.collection('bookings').getOne(bookingId);

    await adminPb.collection('bookings').update(bookingId, { status: newStatus });

    // If the booking is completed and used a subscription wash, deduct from user's balance
    if (newStatus === 'completed' && booking.price === 0 && booking.user) {
      try {
        const user = await adminPb.collection('users').getOne(booking.user);
        if (user.is_subscriber) {
          const subs = await adminPb.collection('subscriptions').getList(1, 1, {
            filter: `user = "${booking.user}" && status = "active"`,
            sort: '-created'
          });
          if (subs.items.length > 0) {
            const sub = subs.items[0];
            if (sub.washes_remaining > 0) {
              const newWashes = sub.washes_remaining - 1;
              const subUpdate: any = { washes_remaining: newWashes };

              if (newWashes === 0) {
                subUpdate.status = 'expired';
                subUpdate.notes = (sub.notes || "") + `\nSubscription expired on ${new Date().toISOString()} because all washes were used.`;
                await adminPb.collection('users').update(user.id, { is_subscriber: false });
              }

              await adminPb.collection('subscriptions').update(sub.id, subUpdate);
              invalidateCache(`profile:${user.id}`);
            }
          }
        }
      } catch (err) {
        console.error("Error updating subscription wash balance:", err);
      }
    }

    // Invalidate all booking-related caches
    invalidateCache('bookings:');
    invalidateCache('admin_stats');

    revalidatePath('/admin');
    revalidatePath('/admin/reservations');
    revalidatePath('/profile');
    revalidatePath('/my-bookings');
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
    revalidatePath('/admin/reservations');
    revalidatePath('/profile');
    revalidatePath('/my-bookings');
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
      filters.push(`(full_name ~ "${q}" || email ~ "${q}" || phone ~ "${q}" || id ~ "${q}" || plate ~ "${q}" || default_plate ~ "${q}" || plate_number ~ "${q}")`);
    }
    const filter = filters.join(' && ');

    const options: any = {
      sort: '-created',
      requestKey: null,
      fetch: (url: string, config: any) => fetch(url, { ...config, cache: 'no-store' })
    };
    if (filter) options.filter = filter;

    const cacheKey = `users:admin:${page}:${perPage}:${searchQuery}`;
    const records = await cached(cacheKey, 30 * 1000, async () => {
      return await adminPb.collection('users').getList(page, perPage, options);
    });
    const items = records.items.map((record: any) => ({
      ...record,
      plate: record.plate || record.default_plate || record.plate_number || record.carModel || ""
    }));

    return {
      success: true,
      items: JSON.parse(JSON.stringify(items)),
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

export async function getAllSubscriptions(page = 1, perPage = 20, statusFilter = '', searchQuery = '') {
  try {
    await authenticateAdmin();
    const adminPb = await getAdminPB();

    const filters: string[] = [];
    if (statusFilter && statusFilter !== 'all') filters.push(`status = "${statusFilter}"`);
    if (searchQuery) {
      const q = searchQuery.replace(/"/g, '\\"');
      filters.push(`(user.full_name ~ "${q}" || user.email ~ "${q}" || plan ~ "${q}")`);
    }
    const filter = filters.join(' && ');

    const cacheKey = `subscriptions:admin:${page}:${perPage}:${statusFilter}:${searchQuery}`;
    const records = await cached(cacheKey, 15 * 1000, async () => {
      return await adminPb.collection('subscriptions').getList(page, perPage, {
        filter,
        sort: '-created',
        expand: 'user'
      });
    });

    return {
      success: true,
      items: JSON.parse(JSON.stringify(records.items)),
      totalItems: records.totalItems,
      totalPages: records.totalPages,
      page: records.page,
    };
  } catch (error: any) {
    console.error("Admin getAllSubscriptions error:", error);
    return { success: false, error: error.message, items: [], totalItems: 0, totalPages: 0, page: 1 };
  }
}

import { PLANS, PlanId } from '@/lib/plans';

export async function approveSubscription(subscriptionId: string) {
  try {
    await authenticateAdmin();
    const adminPb = await getAdminPB();

    // 1. Get the request
    const subRequest = await adminPb.collection('subscriptions').getOne(subscriptionId);
    if (subRequest.status !== 'pending') throw new Error("Subscription is not in pending state.");

    const planId = subRequest.plan as PlanId;
    const planDetails = PLANS[planId];
    if (!planDetails) throw new Error("Invalid plan type.");

    // 2. Calculate Dates
    const startDate = new Date();
    // end_date is relative to approval date (not creation date)
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + planDetails.durationDays);

    // 3. Update both Subscription and User in parallel
    await Promise.all([
      // Update the ledger (the subscription record)
      adminPb.collection('subscriptions').update(subscriptionId, {
        status: 'active',
        expiry_date: expiryDate.toISOString(),
        washes_remaining: planDetails.washes,
        updated: startDate.toISOString(),
        notes: (subRequest.notes || "") + "\nApproved by Admin on " + startDate.toISOString()
      }),
      // Update the user's active plan and washes
      adminPb.collection('users').update(subRequest.user, {
        is_subscriber: true,
        role: 'subscriber'
      })
    ]);

    // Invalidate caches
    invalidateCache('admin_stats');
    invalidateCache(`profile:${subRequest.user}`);
    invalidateCache('users:admin:');
    invalidateCache('subscriptions:admin:');

    revalidatePath('/admin');
    revalidatePath('/admin/subscriptions');
    revalidatePath('/admin/clients');
    revalidatePath('/subscribe');
    revalidatePath('/profile');

    return { success: true };
  } catch (error: any) {
    console.error("Admin approveSubscription error:", error);
    return { success: false, error: error.message };
  }
}

export async function rejectSubscription(subscriptionId: string, reason: string) {
  try {
    await authenticateAdmin();
    const adminPb = await getAdminPB();

    await adminPb.collection('subscriptions').update(subscriptionId, {
      status: 'rejected',
      notes: "Rejected: " + reason,
      updated: new Date().toISOString()
    });

    invalidateCache('subscriptions:admin:');

    revalidatePath('/admin');
    revalidatePath('/admin/subscriptions');
    revalidatePath('/subscribe');
    revalidatePath('/profile');

    return { success: true };
  } catch (error: any) {
    console.error("Admin rejectSubscription error:", error);
    return { success: false, error: error.message };
  }
}
