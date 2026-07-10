// A lightweight, in-memory rate limiter for MVP purposes.
// In a true multi-server production environment or Vercel Edge, 
// this should be replaced with Upstash Redis or similar.

type RateLimitContext = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitContext>();

interface RateLimitConfig {
  max: number; // max requests
  windowMs: number; // time window in milliseconds
}

export const rateLimitConfig = {
  LOGIN: { max: 5, windowMs: 60 * 1000 },       // 5 attempts per minute
  API: { max: 60, windowMs: 60 * 1000 },        // 60 requests per minute
  WEBHOOK: { max: 100, windowMs: 60 * 1000 },   // 100 requests per minute
};

export function checkRateLimit(ip: string, action: keyof typeof rateLimitConfig): boolean {
  const config = rateLimitConfig[action];
  const key = `${action}:${ip}`;
  const now = Date.now();

  const record = store.get(key);

  if (!record) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return true; // Allowed
  }

  // If window expired, reset
  if (now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return true; // Allowed
  }

  // If within window, increment and check
  if (record.count >= config.max) {
    return false; // Rate limited
  }

  record.count += 1;
  store.set(key, record);
  return true; // Allowed
}

// Optional cleanup utility to prevent memory leaks in long-running node processes
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(key);
    }
  }
}
