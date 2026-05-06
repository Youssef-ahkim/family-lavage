"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminPB, getPublicPB } from '@/lib/pocketbase';
import { cached, invalidateCache, CACHE_TTL } from '@/lib/cache';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: "auth.errors.fieldsRequired" };
  }

  try {
    // Login uses a public PB client — the user provides their own credentials
    const pb = getPublicPB();

    await pb.collection('users').authWithPassword(email, password);

    const cookieStore = await cookies();
    const cookieString = pb.authStore.exportToCookie({ httpOnly: false });
    // Parse the cookie string to set it properly in Next.js
    const cookieParts = cookieString.split(';');
    const cookieValue = cookieParts[0].split('=')[1];

    cookieStore.set('pb_auth', cookieValue, {
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

    // Invalidate any stale profile cache for this user
    if (pb.authStore.model) {
      invalidateCache(`profile:${pb.authStore.model.id}`);
    }

    return { success: true };
  } catch (error: any) {
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
  const plate = formData.get('plate') as string;

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
    const cookieParts = cookieString.split(';');
    const cookieValue = cookieParts[0].split('=')[1];

    cookieStore.set('pb_auth', cookieValue, {
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

    return { success: true };
  } catch (error: any) {
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
      const pb = getPublicPB();
      pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);
      if (pb.authStore.model) {
        invalidateCache(`profile:${pb.authStore.model.id}`);
        invalidateCache(`bookings:${pb.authStore.model.id}`);
      }
    } catch (_) {}
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

    const pb = getPublicPB();
    pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);

    if (pb.authStore.isValid && pb.authStore.model) {
      const userId = pb.authStore.model.id;
      
      // Use cached profile data (60s TTL) — avoids hitting PB on every navigation
      return await cached(`profile:${userId}`, CACHE_TTL.PROFILE, async () => {
        try {
          // Use ADMIN client to fetch fresh user data — bypasses any restrictive view rules
          const adminPb = await getAdminPB();
          const freshModel = await adminPb.collection('users').getOne(userId);

          let phoneStr = freshModel.phone?.toString() || pb.authStore.model!.phone?.toString() || "";
          if (phoneStr.length === 9 && !phoneStr.startsWith('0') && !phoneStr.startsWith('+')) {
            phoneStr = '0' + phoneStr;
          }

          return {
            id: freshModel.id,
            name: freshModel.name || freshModel.full_name || freshModel.fullname || pb.authStore.model!.name || "",
            email: freshModel.email,
            phone: phoneStr,
            plate: freshModel.plate || freshModel.default_plate || freshModel.plate_number || freshModel.carModel || pb.authStore.model!.plate || "",
            role: freshModel.role || "",
          };
        } catch (e) {
          // Fallback to cookie model if admin fetch fails
          const model = pb.authStore.model!;

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
          };
        }
      });
    }
  } catch (error) {
    console.error("Get Profile Error:", error);
  }
  return null;
}
