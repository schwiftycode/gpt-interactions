/**
 * @fileoverview Task-related routes for the Motion API
 */

const express = require("express");
const router = express.Router();
const motionApi = require("./helpers/api");
const {
  requireBodyParams,
  requireQueryParams,
} = require("./helpers/paramValidation");

/**
 * Retrieve all tasks
 * @route GET /tasks
 */
router.get("/", requireQueryParams(["workspaceId"]), async (req, res) => {
  try {
    const params = { ...req.query };
    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );

    const response = await motionApi.get("/tasks", { params });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching tasks from Motion:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to fetch tasks from Motion API",
    });
  }
});

/**
 * Create a new task
 * @route POST /tasks
 */
router.post(
  "/",
  requireBodyParams(["name", "workspaceId"]),
  async (req, res) => {
    try {
      const response = await motionApi.post("/tasks", req.body, {
        params: { workspaceId: req.body.workspaceId },
      });
      res.json(response.data);
    } catch (error) {
      console.error("Error creating task:", error.message);
      if (error.response?.data) {
        console.error("API Error Details:", error.response.data);
      }
      res.status(error.response?.status || 500).json({
        error: error.response?.data || "Failed to create task",
      });
    }
  }
);

/**
 * Retrieve a specific task by ID
 * @route GET /tasks/:taskId
 */
router.get(
  "/:taskId",
  requireQueryParams(["workspaceId"]),
  async (req, res) => {
    try {
      const response = await motionApi.get(`/tasks/${req.params.taskId}`, {
        params: { workspaceId: req.query.workspaceId },
      });
      res.json(response.data);
    } catch (error) {
      console.error("Error retrieving task:", error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data || "Failed to retrieve task",
      });
    }
  }
);

/**
 * Update a specific task
 * @route PATCH /tasks/:taskId
 */
router.patch(
  "/:taskId",
  requireBodyParams(["workspaceId"]),
  async (req, res) => {
    try {
      const response = await motionApi.patch(
        `/tasks/${req.params.taskId}`,
        req.body,
        {
          params: { workspaceId: req.body.workspaceId },
        }
      );
      res.json(response.data);
    } catch (error) {
      console.error("Error updating task:", error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data || "Failed to update task",
      });
    }
  }
);

/**
 * Delete a specific task
 * @route DELETE /tasks/:taskId
 */
router.delete(
  "/:taskId",
  requireQueryParams(["workspaceId"]),
  async (req, res) => {
    try {
      const response = await motionApi.delete(`/tasks/${req.params.taskId}`, {
        params: { workspaceId: req.query.workspaceId },
      });
      res.json(response.data);
    } catch (error) {
      console.error("Error deleting task:", error.message);
      res.status(error.response?.status || 500).json({
        error: error.response?.data || "Failed to delete task",
      });
    }
  }
);

module.exports = router;
