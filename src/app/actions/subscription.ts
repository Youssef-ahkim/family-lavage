"use server";

import { getAdminPB, getPublicPB } from '@/lib/pocketbase';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';


/**
 * Handles a user's request to subscribe to a plan.
 * Creates a pending record in the 'subscriptions' collection.
 */
export async function requestSubscription(planId: string) {
  try {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth');
    
    if (!pbAuth) {
      return { success: false, error: "auth.errors.unauthorized" };
    }

    const pb = getPublicPB();
    pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);
    
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return { success: false, error: "auth.errors.unauthorized" };
    }

    const userId = pb.authStore.model.id;
    
    // Use ADMIN client to interact with 'subscriptions' and 'services'
    const adminPb = await getAdminPB();

    // Fetch plan details from the DB
    const plan = await adminPb.collection('services').getOne(planId);
    if (!plan || plan.category !== 'subscription') {
      throw new Error("Invalid plan selection");
    }

    // Check if there's already a pending or active subscription for this user
    const existing = await adminPb.collection('subscriptions').getList(1, 1, {
      filter: `user = "${userId}" && (status = "pending" || status = "active")`
    });

    if (existing.totalItems > 0) {
      const isPending = existing.items[0].status === 'pending';
      return { 
        success: false, 
        error: isPending ? "subscription.errors.alreadyPending" : "subscription.errors.alreadyActive" 
      };
    }

    // Determine the plan type for the 'Select' field in PB
    const planType = plan.plan_type || 'monthly';

    // Create the pending subscription record
    await adminPb.collection('subscriptions').create({
      user: userId,
      plan: planType, // "monthly" or "yearly" from your new dropdown
      status: 'pending',
      amount: plan.price,
      notes: `User requested ${plan.title_en} via website.`,
      created: new Date().toISOString(),
    });

    // We must import invalidateCache from @/lib/cache if it's not already imported.
    const { invalidateCache } = await import('@/lib/cache');
    invalidateCache('subscriptions:admin:');

    revalidatePath('/profile');
    revalidatePath('/admin');
    revalidatePath('/admin/subscriptions');
    
    return { success: true };
  } catch (error: any) {
    console.error("Subscription Request Error:", error);
    return { success: false, error: "errors.general" };
  }
}

/**
 * Fetches the user's current subscription requests (audit trail).
 */
export async function getMySubscriptionRequests() {
  try {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth');
    if (!pbAuth) return [];

    const pb = getPublicPB();
    pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);
    if (!pb.authStore.isValid || !pb.authStore.model) return [];

    const userId = pb.authStore.model.id;
    const adminPb = await getAdminPB();
    
    const records = await adminPb.collection('subscriptions').getList(1, 50, {
      filter: `user = "${userId}"`,
      sort: '-created'
    });

    return JSON.parse(JSON.stringify(records.items));
  } catch (error) {
    console.error("Get My Subscriptions Error:", error);
    return [];
  }
}
