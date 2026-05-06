import PocketBase from 'pocketbase';
import { getCached, setCache, CACHE_TTL } from './cache';

// ─────────────────────────────────────────────────────────
// ADMIN PROXY PATTERN + CACHED AUTH
// PocketBase is NEVER exposed to the browser.
// The superadmin token is cached in-memory so we don't
// re-authenticate on every single server action call.
// ─────────────────────────────────────────────────────────

const POCKETBASE_URL = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090/';

// ─── Cached Admin Singleton ───
// We store the admin auth token (not the PB instance) so we can
// stamp it onto fresh PB clients without a network roundtrip.
let _cachedAdminToken: string | null = null;
let _cachedAdminTokenExpiry = 0;

/**
 * Returns a PocketBase client authenticated as superadmin.
 * The auth token is cached in-memory for 10 minutes,
 * eliminating a full roundtrip on every server action.
 */
export async function getAdminPB(): Promise<PocketBase> {
  const pb = new PocketBase(POCKETBASE_URL);
  
  // Try to reuse the cached admin token
  if (_cachedAdminToken && Date.now() < _cachedAdminTokenExpiry) {
    pb.authStore.save(_cachedAdminToken, null);
    // Quick validity check — if the token is still good, return immediately
    if (pb.authStore.isValid) {
      return pb;
    }
    // Token expired or invalid, fall through to re-auth
    _cachedAdminToken = null;
  }

  const email = process.env.PB_ADMIN_EMAIL;
  const password = process.env.PB_ADMIN_PASSWORD;
  
  if (!email || !password) {
    throw new Error(
      'Missing PB_ADMIN_EMAIL or PB_ADMIN_PASSWORD environment variables. ' +
      'These are required for the Admin Proxy pattern.'
    );
  }

  try {
    // PocketBase v0.23+ uses _superusers collection for admin auth
    await pb.collection('_superusers').authWithPassword(email, password);
    
    // Cache the token for 10 minutes
    _cachedAdminToken = pb.authStore.token;
    _cachedAdminTokenExpiry = Date.now() + CACHE_TTL.ADMIN_AUTH;
  } catch (err: any) {
    console.error('Admin Proxy auth failed:', {
      url: POCKETBASE_URL,
      email: email,
      passwordLength: password.length,
      error: err?.response || err?.message || err,
    });
    throw new Error('Failed to authenticate as PocketBase superadmin. Check PB_ADMIN_EMAIL/PB_ADMIN_PASSWORD in .env.local');
  }
  
  return pb;
}

/**
 * Returns a plain (unauthenticated) PocketBase client.
 * Used only for user-facing auth flows (login/signup)
 * where the user provides their own credentials.
 */
export function getPublicPB(): PocketBase {
  return new PocketBase(POCKETBASE_URL);
}