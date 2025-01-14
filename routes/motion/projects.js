/**
 * @fileoverview Project-related routes for the Motion API
 */

const express = require("express");
const router = express.Router();
const motionApi = require("./helpers/api");
const {
  requireBodyParams,
  requireQueryParams,
} = require("./helpers/paramValidation");

/**
 * Retrieve all projects
 * @route GET /projects
 */
router.get("/", requireQueryParams(["workspaceId"]), async (req, res) => {
  try {
    const response = await motionApi.get("/projects", {
      params: { workspaceId: req.query.workspaceId },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to fetch projects",
    });
  }
});

/**
 * Create a new project
 * @route POST /projects
 */
router.post("/", requireBodyParams(["workspaceId"]), async (req, res) => {
  try {
    const response = await motionApi.post("/projects", req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Error creating project:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to create project",
    });
  }
});

/**
 * Retrieve a specific project
 * @route GET /projects/:projectId
 */
router.get(
  "/:projectId",
  requireQueryParams(["workspaceId"]),
  async (req, res) => {
    try {
      const response = await motionApi.get(
        `/projects/${req.params.projectId}`,
        {
          params: { workspaceId: req.query.workspaceId },
        }
      );
      res.json(response.data);
    } catch (error) {
      console.error("Error retrieving project:", error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data || "Failed to retrieve project",
      });
    }
  }
);

module.exports = router;
