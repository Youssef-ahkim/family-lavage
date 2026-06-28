"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminPB, getPublicPB } from '@/lib/pocketbase';
import { cached, invalidateCache, CACHE_TTL } from '@/lib/cache';
import { checkRateLimit } from '@/lib/ratelimit';

export async function verifySession(cookieValue: string) {
  if (!cookieValue) return { isValid: false, model: null };

  try {
    const pb = getPublicPB();
    // loadFromCookie automatically parses the URL-encoded JSON cookie value
    pb.authStore.loadFromCookie(`pb_auth=${cookieValue}`);
    
    const realToken = pb.authStore.token;
    if (!realToken) return { isValid: false, model: null };

    // Cache using the actual JWT token to prevent duplicate refreshes
    return await cached(`session:${realToken}`, 15 * 1000, async () => {
      try {
        const refreshPb = getPublicPB();
        refreshPb.authStore.save(realToken, null);
        await refreshPb.collection('users').authRefresh();
        
        if (refreshPb.authStore.isValid && refreshPb.authStore.model) {
          return {
            isValid: true,
            model: JSON.parse(JSON.stringify(refreshPb.authStore.model))
          };
        }
      } catch (err) {
        console.error("verifySession verification request failed:", err);
      }
      return { isValid: false, model: null };
    });
  } catch (err) {
    console.error("verifySession failed to load cookie string:", err);
    return { isValid: false, model: null };
  }
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Rate Limiting
  const { success: rateLimitOk } = await checkRateLimit('login');
  if (!rateLimitOk) {
    return { success: false, error: "auth.errors.tooManyRequests" };
  }

  if (!email || !password) {
    return { success: false, error: "auth.errors.fieldsRequired" };
  }

  try {
    // Login uses a public PB client — the user provides their own credentials
    const pb = getPublicPB();

    await pb.collection('users').authWithPassword(email, password);

    const cookieStore = await cookies();
    const cookieString = pb.authStore.exportToCookie({ httpOnly: false });
    const token = cookieString.split(';')[0].replace('pb_auth=', '');

    cookieStore.set('pb_auth', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.DISABLE_SECURE_COOKIE === 'true' ? false : process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    // Secondary cookie for UI state (visible to client JS)
    cookieStore.set('pb_logged_in', 'true', {
      path: '/',
      httpOnly: false,
      secure: process.env.DISABLE_SECURE_COOKIE === 'true' ? false : process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    // Invalidate any stale profile cache for this user & link guest bookings
    if (pb.authStore.model) {
      const userId = pb.authStore.model.id;
      invalidateCache(`profile:${userId}`);

      // Link guest bookings to this user
      const guestBookings = cookieStore.get('my_bookings')?.value || "";
      if (guestBookings) {
        try {
          const adminPb = await getAdminPB();
          const ids = guestBookings.split(',').filter(id => id.length > 0);
          for (const id of ids) {
            try {
              await adminPb.collection('bookings').update(id, { user: userId });
            } catch (e) {
              console.error(`Failed to link guest booking ${id} to user ${userId}:`, e);
            }
          }
          cookieStore.delete('my_bookings');
          invalidateCache(`bookings:${userId}`);
        } catch (e) {
          console.error("Error migrating guest bookings during login:", e);
        }
      }
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Login Error:", error);
    return { success: false, error: "auth.errors.invalidCredentials" };
  }
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const passwordConfirm = formData.get('passwordConfirm') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const plate = (formData.get('plate') as string || '').trim();

  // Rate Limiting
  const { success: rateLimitOk } = await checkRateLimit('signup');
  if (!rateLimitOk) {
    return { success: false, error: "auth.errors.tooManyRequests" };
  }

  if (!email || !password || !passwordConfirm || !name) {
    return { success: false, error: "auth.errors.fieldsRequired" };
  }

  if (password !== passwordConfirm) {
    return { success: false, error: "auth.errors.passwordMismatch" };
  }

  if (password.length < 8) {
    return { success: false, error: "auth.errors.passwordTooShort" };
  }

  try {
    // Use ADMIN client to create the user — this guarantees the role is set server-side
    // and the user cannot inject fields like "role: admin"
    const adminPb = await getAdminPB();

    const data = {
      email,
      password,
      passwordConfirm,
      name,
      full_name: name,
      phone,
      plate,
      default_plate: plate,
      plate_number: plate,
      emailVisibility: true,
      role: 'client', // FORCED server-side — users can never set their own role
      created: new Date().toISOString(),
    };

    await adminPb.collection('users').create(data);

    // Auto login with a PUBLIC client (user's own credentials)
    const pb = getPublicPB();
    await pb.collection('users').authWithPassword(email, password);

    const cookieStore = await cookies();
    const cookieString = pb.authStore.exportToCookie({ httpOnly: false });
    const token = cookieString.split(';')[0].replace('pb_auth=', '');

    cookieStore.set('pb_auth', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.DISABLE_SECURE_COOKIE === 'true' ? false : process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    // Secondary cookie for UI state (visible to client JS)
    cookieStore.set('pb_logged_in', 'true', {
      path: '/',
      httpOnly: false,
      secure: process.env.DISABLE_SECURE_COOKIE === 'true' ? false : process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    if (pb.authStore.model) {
      const userId = pb.authStore.model.id;
      const guestBookings = cookieStore.get('my_bookings')?.value || "";
      if (guestBookings) {
        try {
          const ids = guestBookings.split(',').filter(id => id.length > 0);
          for (const id of ids) {
            try {
              await adminPb.collection('bookings').update(id, { user: userId });
            } catch (e) {
              console.error(`Failed to link guest booking ${id} to user ${userId}:`, e);
            }
          }
          cookieStore.delete('my_bookings');
          invalidateCache(`bookings:${userId}`);
        } catch (e) {
          console.error("Error migrating guest bookings during signup:", e);
        }
      }
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("Signup Error:", error);
    return { success: false, error: "auth.errors.emailInUse" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  
  // Invalidate cached profile before clearing cookies
  const pbAuth = cookieStore.get('pb_auth');
  if (pbAuth) {
    try {
      const { isValid, model } = await verifySession(pbAuth.value);
      if (isValid && model) {
        invalidateCache(`profile:${model.id}`);
        invalidateCache(`bookings:${model.id}`);
      }
    } catch {}
  }

  cookieStore.delete('pb_auth');
  cookieStore.delete('pb_logged_in');
  redirect('/');
}

export async function getProfile() {
  try {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth');
    if (!pbAuth) return null;

    const { isValid, model } = await verifySession(pbAuth.value);
    if (!isValid || !model) return null;

    const userId = model.id;
    
    // Use cached profile data (60s TTL) — avoids hitting PB on every navigation
    return await cached(`profile:${userId}`, CACHE_TTL.PROFILE, async () => {
      try {
        // Use ADMIN client to fetch fresh user data — bypasses any restrictive view rules
        const adminPb = await getAdminPB();
        const freshModel = await adminPb.collection('users').getOne(userId);

        let phoneStr = freshModel.phone?.toString() || model.phone?.toString() || "";
        if (phoneStr.length === 9 && !phoneStr.startsWith('0') && !phoneStr.startsWith('+')) {
          phoneStr = '0' + phoneStr;
        }

        let washes_remaining = 0;
        let subscription_expiry = "";
        let subscription_status = "none";
        
        if (freshModel.is_subscriber) {
           try {
              const subs = await adminPb.collection('subscriptions').getList(1, 1, { filter: `user = "${userId}" && status = "active"`, sort: '-created' });
              if (subs.items.length > 0) {
                 washes_remaining = subs.items[0].washes_remaining || 0;
                 subscription_expiry = subs.items[0].expiry_date || "";
                 subscription_status = "active";
              } else {
                 await adminPb.collection('users').update(userId, { is_subscriber: false });
              }
           } catch(e) {
              console.error("Error fetching active sub for profile:", e);
           }
        }

        return {
          id: freshModel.id,
          name: freshModel.name || freshModel.full_name || freshModel.fullname || model.name || "",
          email: freshModel.email,
          phone: phoneStr,
          plate: freshModel.plate || freshModel.default_plate || freshModel.plate_number || freshModel.carModel || model.plate || "",
          role: freshModel.role || "",
          subscription_status,
          subscription_expiry,
          washes_remaining,
        };
      } catch {
        // Fallback to verified model details if admin fetch fails
        let phoneStr = model.phone?.toString() || "";
        if (phoneStr.length === 9 && !phoneStr.startsWith('0') && !phoneStr.startsWith('+')) {
          phoneStr = '0' + phoneStr;
        }

        return {
          id: model.id,
          name: model.name || model.full_name || model.fullname || "",
          email: model.email,
          phone: phoneStr,
          plate: model.plate || model.default_plate || model.plate_number || model.carModel || "",
          role: model.role || "",
          subscription_status: model.is_subscriber ? "active" : "none",
          subscription_expiry: "",
          washes_remaining: 0,
        };
      }
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
  }
  return null;
}
