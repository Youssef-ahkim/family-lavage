import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

/**
 * Upstash Rate Limiter implementation
 * 
 * To use this, you must set the following environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? Redis.fromEnv()
  : null;

export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : null;

/**
 * Helper to check rate limit for the current user's IP
 * @param actionName Name of the action (e.g., 'login', 'signup')
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkRateLimit(actionName: string) {
  // Fallback if Upstash is not configured
  if (!ratelimit) {
    if (process.env.NODE_ENV === 'production') {
      console.error("Rate limiting is DISABLED in production because Upstash credentials are missing.");
    }
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  // Get IP address from headers
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
  
  // Create a unique key for this IP and action
  const identifier = `${actionName}:${ip}`;
  
  return await ratelimit.limit(identifier);
}
