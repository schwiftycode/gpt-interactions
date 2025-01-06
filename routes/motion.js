const express = require("express");
const axios = require("axios");
const router = express.Router();

// Fetch tasks from Motion API
router.get("/tasks", async (req, res) => {
  try {
    const response = await axios.get("https://api.usemotion.com/v1/tasks", {
      headers: {
        "X-API-Key": process.env.MOTION_API_KEY,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching tasks from Motion:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to fetch tasks from Motion API",
    });
  }
});

module.exports = router;
