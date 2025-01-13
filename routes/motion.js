/**
 * @fileoverview Motion API routes for managing tasks, projects, users, and schedules
 * @module routes/motion
 */

const express = require("express");
const axios = require("axios");
const router = express.Router();

/**
 * Axios instance configured for Motion API requests
 * @constant {import('axios').AxiosInstance}
 */
const motionApi = axios.create({
  baseURL: "https://api.usemotion.com/v1",
  headers: {
    "X-API-Key": process.env.MOTION_API_KEY,
    "Content-Type": "application/json",
  },
});

// Helper to check for required workspaceId
const requireWorkspaceId = (req, res, next) => {
  const { workspaceId } = req.query;
  if (!workspaceId) {
    return res.status(400).json({
      error: {
        message: "workspaceId is required",
        error: "Bad Request",
        statusCode: 400,
      },
    });
  }
  next();
};

/**
 * Retrieve all tasks
 * @route GET /tasks
 */
router.get("/tasks", async (req, res) => {
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
router.post("/tasks", requireWorkspaceId, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      workspaceId: req.query.workspaceId,
    };

    const response = await motionApi.post("/tasks", taskData, {
      params: { workspaceId: req.query.workspaceId },
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
});

/**
 * Retrieve a specific task by ID
 * @route GET /tasks/:taskId
 */
router.get("/tasks/:taskId", requireWorkspaceId, async (req, res) => {
  try {
    const params = { ...req.query };
    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );

    const response = await motionApi.get(`/tasks/${req.params.taskId}`, {
      params,
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error retrieving task:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to retrieve task",
    });
  }
});

/**
 * Update a specific task
 * @route PATCH /tasks/:taskId
 */
router.patch("/tasks/:taskId", async (req, res) => {
  try {
    const response = await motionApi.patch(
      `/tasks/${req.params.taskId}`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to update task",
    });
  }
});

/**
 * Delete a specific task
 * @route DELETE /tasks/:taskId
 */
router.delete("/tasks/:taskId", requireWorkspaceId, async (req, res) => {
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
});

/**
 * Retrieve all projects
 * @route GET /projects
 */
router.get("/projects", requireWorkspaceId, async (req, res) => {
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
router.post("/projects", requireWorkspaceId, async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      workspaceId: req.query.workspaceId,
    };
    const response = await motionApi.post("/projects", projectData);
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
router.get("/projects/:projectId", requireWorkspaceId, async (req, res) => {
  try {
    const response = await motionApi.get(`/projects/${req.params.projectId}`, {
      params: { workspaceId: req.query.workspaceId },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error retrieving project:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to retrieve project",
    });
  }
});

/**
 * Retrieve current user info
 * @route GET /users/me
 */
router.get("/users/me", requireWorkspaceId, async (req, res) => {
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
