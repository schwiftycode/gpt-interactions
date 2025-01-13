require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { motionLimiter, generalLimiter } = require("./middlewares/rateLimiter");
const motionRoutes = require("./routes/motion");

const app = express();
const port = process.env.PORT || 3000;

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
// Apply general rate limiter to all routes except /motion
app.use((req, res, next) => {
  if (!req.path.startsWith("/motion")) {
    return generalLimiter(req, res, next);
  }
  next();
});

// Health check route
app.get("/", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Routes with Motion-specific rate limiter
app.use("/motion", motionLimiter, motionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Export app for testing
module.exports = app;

// Start server if not being required (i.e., in test)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
