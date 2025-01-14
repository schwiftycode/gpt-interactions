/**
 * @fileoverview User-related routes for the Motion API
 */

const express = require("express");
const router = express.Router();
const motionApi = require("./helpers/api");
const { requireQueryParams } = require("./helpers/paramValidation");

/**
 * Retrieve current user info
 * @route GET /users/me
 */
router.get("/me", requireQueryParams(["workspaceId"]), async (req, res) => {
  try {
    const response = await motionApi.get("/users/me", {
      params: { workspaceId: req.query.workspaceId },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching current user:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to fetch current user",
    });
  }
});

module.exports = router;
