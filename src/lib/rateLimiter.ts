/**
 * Simple client-side rate limiter
 * For production, implement server-side rate limiting in Supabase Edge Functions
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing attempts for this key
    let keyAttempts = this.attempts.get(key) || [];

    // Filter out old attempts outside the window
    keyAttempts = keyAttempts.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (keyAttempts.length >= config.maxAttempts) {
      return false;
    }

    // Add current attempt
    keyAttempts.push(now);
    this.attempts.set(key, keyAttempts);

    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  getRemainingAttempts(key: string, config: RateLimitConfig): number {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let keyAttempts = this.attempts.get(key) || [];
    keyAttempts = keyAttempts.filter(timestamp => timestamp > windowStart);

    return Math.max(0, config.maxAttempts - keyAttempts.length);
  }
}

export const rateLimiter = new RateLimiter();

// Predefined configs
export const RATE_LIMITS = {
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  REGISTER: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  ADD_EXPENSE: { maxAttempts: 30, windowMs: 60 * 1000 }, // 30 expenses per minute
};
