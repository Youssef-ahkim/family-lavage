// ─────────────────────────────────────────────────────────
// SERVER-SIDE CACHE
// In-memory TTL cache for the Node.js process.
// Eliminates redundant PocketBase queries across
// server action calls within the same process.
// ─────────────────────────────────────────────────────────

interface CacheEntry<T = any> {
  data: T;
  expiry: number;
}

const store = new Map<string, CacheEntry>();

// Auto-cleanup stale entries every 5 minutes
let cleanupInterval: ReturnType<typeof setInterval> | null = null;
function ensureCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.expiry) store.delete(key);
    }
  }, 5 * 60 * 1000);
  // Don't prevent Node from exiting
  if (cleanupInterval?.unref) cleanupInterval.unref();
}

/**
 * Get a cached value by key. Returns null if expired or missing.
 */
export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

/**
 * Set a cache value with a TTL in milliseconds.
 */
export function setCache<T>(key: string, data: T, ttlMs: number): void {
  ensureCleanup();
  store.set(key, { data, expiry: Date.now() + ttlMs });
}

/**
 * Invalidate a specific cache key or all keys matching a prefix.
 */
export function invalidateCache(keyOrPrefix: string): void {
  if (store.has(keyOrPrefix)) {
    store.delete(keyOrPrefix);
    return;
  }
  // Prefix invalidation
  for (const key of store.keys()) {
    if (key.startsWith(keyOrPrefix)) store.delete(key);
  }
}

/**
 * Get-or-set pattern: returns cached data if fresh,
 * otherwise calls the fetcher, caches the result, and returns it.
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const existing = getCached<T>(key);
  if (existing !== null) return existing;

  const data = await fetcher();
  setCache(key, data, ttlMs);
  return data;
}

// ─── Cache TTL Constants ───
export const CACHE_TTL = {
  ADMIN_AUTH: 10 * 60 * 1000,   // 10 min — superadmin token
  PROFILE: 60 * 1000,           // 60s — user profile data
  BOOKINGS: 30 * 1000,          // 30s — user's bookings list
  BOOKED_SLOTS: 30 * 1000,      // 30s — available time slots
  ADMIN_STATS: 30 * 1000,       // 30s — admin dashboard stats
} as const;
