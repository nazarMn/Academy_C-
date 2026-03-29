/**
 * rateLimiter.js — In-memory rate limiting middleware
 * Suitable for single-instance deployments (Render free tier)
 */

const { logger } = require('../utils/logger');

/**
 * Create a rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs  - Time window in ms (default: 60000 = 1 min)
 * @param {number} options.max       - Max requests per window (default: 30)
 * @param {string} options.message   - Error message when rate limited
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  const max = options.max || parseInt(process.env.RATE_LIMIT_MAX || '30', 10);
  const message = options.message || 'Забагато запитів. Спробуйте через хвилину.';

  // In-memory store: IP -> { count, resetTime }
  const store = new Map();

  // Cleanup expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of store) {
      if (now > val.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    let record = store.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      store.set(key, record);
    }

    record.count++;

    // Set rate limit headers
    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(Math.max(0, max - record.count)));
    res.set('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));

    if (record.count > max) {
      logger.warn('RateLimiter', `Rate limited: ${key} (${record.count}/${max})`);
      return res.status(429).json({
        error: message,
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
}

// Pre-configured limiters
const executionLimiter = createRateLimiter({
  windowMs: 60000,
  max: 20,
  message: 'Забагато запитів на виконання коду. Зачекайте хвилину.',
});

const apiLimiter = createRateLimiter({
  windowMs: 60000,
  max: 100,
  message: 'Забагато API запитів. Спробуйте пізніше.',
});

module.exports = { createRateLimiter, executionLimiter, apiLimiter };
