"use server";

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: "Please provide both email and password." };
  }

  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

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

    return { success: true };
  } catch (error: any) {
    console.error("Login Error:", error);
    return { success: false, error: "Invalid email or password." };
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
    return { success: false, error: "All fields are required." };
  }

  if (password !== passwordConfirm) {
    return { success: false, error: "Passwords do not match." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  try {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

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
      created: new Date().toISOString(),
    };

    await pb.collection('users').create(data);

    // Auto login
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
    return { success: false, error: error.response?.message || "Failed to create account. Email might already be in use." };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('pb_auth');
  cookieStore.delete('pb_logged_in');
  redirect('/');
}

export async function getProfile() {
  try {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth');
    if (!pbAuth) return null;

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    pb.authStore.loadFromCookie(`pb_auth=${pbAuth.value}`);

    if (pb.authStore.isValid && pb.authStore.model) {
      try {
        // Fetch fresh data from PocketBase to ensure we get newly added fields that might not be in a stale cookie
        const freshModel = await pb.collection('users').getOne(pb.authStore.model.id);

        let phoneStr = freshModel.phone?.toString() || pb.authStore.model.phone?.toString() || "";
        if (phoneStr.length === 9 && !phoneStr.startsWith('0') && !phoneStr.startsWith('+')) {
          phoneStr = '0' + phoneStr;
        }

        return {
          id: freshModel.id,
          name: freshModel.name || freshModel.full_name || freshModel.fullname || pb.authStore.model.name || "",
          email: freshModel.email,
          phone: phoneStr,
          plate: freshModel.plate || freshModel.default_plate || freshModel.plate_number || freshModel.carModel || pb.authStore.model.plate || "",
          role: freshModel.role || "",
        };
      } catch (e) {
        // Fallback to cookie model if fetch fails
        const model = pb.authStore.model;

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
    }
  } catch (error) {
    console.error("Get Profile Error:", error);
  }
  return null;
}
