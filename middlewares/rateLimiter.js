const rateLimit = require("express-rate-limit");

// Create a store to track Motion API requests across all IPs
const motionStore = new Map();

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
      const currentCount = motionStore.get(key) || 0;
      const newCount = currentCount + 1;
      motionStore.set(key, newCount);
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
      return Promise.resolve();
    },
    resetAll: () => {
      motionStore.clear();
      return Promise.resolve();
    },
    hits: (key) => {
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
