import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client if environment variables are configured
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? Redis.fromEnv()
  : null;

interface CacheEntry<T = unknown> {
  data: T;
  expiry: number;
}

const store = new Map<string, CacheEntry>();

// Auto-cleanup stale entries every 5 minutes (for local Map fallback)
let cleanupInterval: ReturnType<typeof setInterval> | null = null;
function ensureCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.expiry) store.delete(key);
    }
  }, 5 * 60 * 1000);
  if (cleanupInterval?.unref) cleanupInterval.unref();
}

/**
 * Get a cached value by key. Returns null if expired or missing.
 */
export async function getCached<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      const data = await redis.get<T>(key);
      return data;
    } catch (err) {
      console.error("Redis get failed, falling back to local cache:", err);
    }
  }

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
export async function setCache<T>(key: string, data: T, ttlMs: number): Promise<void> {
  if (redis) {
    try {
      await redis.set(key, data, { px: ttlMs });
      return;
    } catch (err) {
      console.error("Redis set failed, falling back to local cache:", err);
    }
  }

  ensureCleanup();
  store.set(key, { data, expiry: Date.now() + ttlMs });
}

/**
 * Invalidate a specific cache key or all keys matching a prefix.
 */
export async function invalidateCache(keyOrPrefix: string): Promise<void> {
  // 1. Invalidate local in-memory store
  if (store.has(keyOrPrefix)) {
    store.delete(keyOrPrefix);
  } else {
    for (const key of store.keys()) {
      if (key.startsWith(keyOrPrefix)) store.delete(key);
    }
  }

  // 2. Invalidate Redis asynchronously
  if (redis) {
    try {
      await invalidateRedisCache(keyOrPrefix);
    } catch (err) {
      console.error("Redis prefix invalidation failed:", err);
    }
  }
}

/**
 * Helper to delete prefix keys from Redis in background.
 */
async function invalidateRedisCache(keyOrPrefix: string): Promise<void> {
  if (!redis) return;

  try {
    // Delete exact match
    await redis.del(keyOrPrefix);

    // Delete matching prefix keys
    const keys = await redis.keys(`${keyOrPrefix}*`);
    if (keys && keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error("Redis keys or del pattern failed:", err);
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
  const existing = await getCached<T>(key);
  if (existing !== null) return existing;

  const data = await fetcher();
  await setCache(key, data, ttlMs);
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
