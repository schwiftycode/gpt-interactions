/**
 * Helper to check for required body parameters
 * @param {string[]} params - Array of parameter names to validate
 */
const requireBodyParams = (params) => (req, res, next) => {
  for (const param of params) {
    if (!req.body[param]) {
      return res.status(400).json({
        error: {
          message: `${param} is required in request body`,
          error: "Bad Request",
          statusCode: 400,
        },
      });
    }
  }
  next();
};

/**
 * Helper to check for required query parameters
 * @param {string[]} params - Array of parameter names to validate
 */
const requireQueryParams = (params) => (req, res, next) => {
  for (const param of params) {
    if (!req.query[param]) {
      return res.status(400).json({
        error: {
          message: `${param} is required in query parameters`,
          error: "Bad Request",
          statusCode: 400,
        },
      });
    }
  }
  next();
};

module.exports = {
  requireBodyParams,
  requireQueryParams,
};
