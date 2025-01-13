/**
 * Helper utility to manage rate limiting during tests
 */
const request = require("supertest");

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
   * Creates a rate-limited supertest request
   * @param {Object} app Express app
   * @returns {Object} Rate limited supertest instance
   */
  createAgent(app) {
    const agent = request(app);
    const methods = ["get", "post", "put", "patch", "delete"];
    const wrappedAgent = {};

    methods.forEach((method) => {
      wrappedAgent[method] = (path) => {
        const req = agent[method](path);
        const originalEnd = req.end;

        // Wrap the end method to handle rate limiting
        req.end = async (callback) => {
          await this.waitForRateLimit();
          return originalEnd.call(req, callback);
        };

        // Add Promise support
        const originalThen = req.then;
        req.then = async function (...args) {
          await this.waitForRateLimit();
          return originalThen.apply(req, args);
        }.bind(this);

        return req;
      };
    });

    return wrappedAgent;
  }
}

module.exports = RateLimitHelper;
