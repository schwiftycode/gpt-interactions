const rateLimit = require("express-rate-limit");

// Create stores to track Motion API requests and their timestamps
const motionStore = new Map();
const lastResetStore = new Map();

// Helper to check and reset if window has expired
const checkAndResetIfExpired = (key, windowMs) => {
  const lastReset = lastResetStore.get(key) || 0;
  const now = Date.now();
  if (now - lastReset >= windowMs) {
    motionStore.delete(key);
    lastResetStore.set(key, now);
    return true;
  }
  return false;
};

// Motion API specific rate limiter
const motionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 11, // 1 request per minute for Motion API
  message:
    "API rate limit exceeded for Motion API. Please try again after a minute",
  standardHeaders: true,
  legacyHeaders: false,
  // Override the default key generator to use a single key for all requests
  keyGenerator: () => "motion_api_global",
  // Use custom store to track requests across all IPs
  store: {
    init: () => {},
    increment: (key) => {
      checkAndResetIfExpired(key, 60 * 1000); // Check for reset before incrementing
      const currentCount = motionStore.get(key) || 0;
      const newCount = currentCount + 1;
      motionStore.set(key, newCount);
      if (!lastResetStore.has(key)) {
        lastResetStore.set(key, Date.now());
      }
      return Promise.resolve({
        totalHits: newCount,
      });
    },
    decrement: (key) => {
      const currentCount = motionStore.get(key) || 0;
      motionStore.set(key, Math.max(0, currentCount - 1));
      return Promise.resolve();
    },
    resetKey: (key) => {
      motionStore.delete(key);
      lastResetStore.set(key, Date.now());
      return Promise.resolve();
    },
    resetAll: () => {
      motionStore.clear();
      lastResetStore.clear();
      return Promise.resolve();
    },
    hits: (key) => {
      checkAndResetIfExpired(key, 60 * 1000); // Check for reset before returning hits
      return Promise.resolve({
        totalHits: motionStore.get(key) || 0,
      });
    },
  },
});

// General rate limiter for other routes
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many requests from this IP, please try again after a minute",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  motionLimiter,
  generalLimiter,
};
