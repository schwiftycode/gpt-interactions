/**
 * Helper utility to manage rate limiting during tests
 */

class RateLimitHelper {
  constructor(requestsPerMinute = 11) {
    this.requestsPerMinute = requestsPerMinute;
    this.requestTimes = [];
  }

  /**
   * Waits if necessary to respect rate limits before making a request
   * @returns {Promise<void>}
   */
  async waitForRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    // Remove requests older than 1 minute
    this.requestTimes = this.requestTimes.filter((time) => time > oneMinuteAgo);

    // If we've hit the rate limit, wait until the oldest request expires
    if (this.requestTimes.length >= this.requestsPerMinute) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = oldestRequest + 60 * 1000 - now;
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      // After waiting, remove the expired request
      this.requestTimes.shift();
    }

    // Add the current request
    this.requestTimes.push(Date.now());
  }

  /**
   * Wraps a function with rate limit handling
   * @param {Function} fn Function to wrap
   * @returns {Function} Rate limit aware function
   */
  wrapWithRateLimit(fn) {
    return async (...args) => {
      await this.waitForRateLimit();
      return fn(...args);
    };
  }
}

module.exports = RateLimitHelper;
