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

/**
 * @typedef {Object} Task
 * @property {string} id - The unique identifier of the task
 * @property {string} title - The title of the task
 * @property {string} [description] - Optional description of the task
 * @property {string} projectId - ID of the project this task belongs to
 * @property {string} workspaceId - ID of the workspace this task belongs to
 * @property {string} status - Current status of the task (BACKLOG, TODO, IN_PROGRESS, DONE, CANCELED)
 * @property {string} [priority] - Priority level of the task (LOW, MEDIUM, HIGH)
 * @property {string[]} [labels] - Array of labels assigned to the task
 * @property {string} [dueDate] - Due date of the task in ISO format
 * @property {string} [scheduledDate] - Scheduled date of the task in ISO format
 * @property {Object[]} [assignees] - Array of users assigned to the task
 * @property {string} assignees[].id - User ID
 * @property {string} assignees[].name - User's name
 * @property {string} assignees[].email - User's email
 * @property {string} [assignees[].avatar] - User's avatar URL
 * @property {number} [timeEstimate] - Time estimate in minutes
 * @property {Object} [customFields] - Custom fields for the task
 * @property {string} createdAt - Creation timestamp in ISO format
 * @property {string} updatedAt - Last update timestamp in ISO format
 */

/**
 * Retrieve all tasks
 * @route GET /tasks
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.workspaceId - ID of the workspace to fetch tasks from (required)
 * @param {string} [req.query.projectId] - Filter tasks by project ID
 * @param {string} [req.query.status] - Filter tasks by status (BACKLOG, TODO, IN_PROGRESS, DONE, CANCELED)
 * @param {string} [req.query.assigneeId] - Filter tasks by assignee ID
 * @param {string} [req.query.dueDate] - Filter tasks by due date (ISO format)
 * @param {string} [req.query.scheduledDate] - Filter tasks by scheduled date (ISO format)
 * @param {string} [req.query.startDate] - Filter tasks by start date (ISO format)
 * @param {string} [req.query.createdAt] - Filter tasks by creation date (ISO format)
 * @param {string} [req.query.updatedAt] - Filter tasks by last update date (ISO format)
 * @param {string} [req.query.priority] - Filter tasks by priority (LOW, MEDIUM, HIGH)
 * @param {string[]} [req.query.labels] - Filter tasks by labels
 * @param {string} [req.query.search] - Search tasks by title or description
 * @param {boolean} [req.query.includeSubtasks] - Include subtasks in response
 * @param {boolean} [req.query.includeCompletedSubtasks] - Include completed subtasks
 * @param {string} [req.query.sortBy] - Field to sort by (dueDate, createdAt, updatedAt, priority, status)
 * @param {string} [req.query.sortOrder] - Sort order (asc, desc)
 * @param {number} [req.query.page] - Page number for pagination (default: 1)
 * @param {number} [req.query.limit] - Number of tasks per page (default: 50, max: 100)
 * @returns {Promise<{data: Task[], meta: {total: number, page: number, limit: number}}>} Array of task objects with pagination metadata
 * @throws {Error} 400 - Missing required workspaceId
 * @throws {Error} 500 - Failed to fetch tasks from Motion API
 */
router.get("/tasks", async (req, res) => {
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

  try {
    // Pass through all query parameters to Motion API
    const params = {
      ...req.query,
      // limit: Math.min(req.query.limit || 50, 100), // Default to 50, max 100
    };

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
 * @param {Object} req.body - Task creation parameters
 * @param {string} req.body.title - Title of the task
 * @param {string} [req.body.description] - Description of the task
 * @param {string} [req.body.dueDate] - Due date in ISO format
 * @param {string[]} [req.body.assignees] - Array of user IDs to assign
 * @returns {Promise<Task>} Created task object
 * @throws {Error} 500 - Failed to create task
 */
router.post("/tasks", async (req, res) => {
  try {
    const response = await motionApi.post("/tasks", req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Error creating task:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to create task",
    });
  }
});

/**
 * Retrieve a specific task by ID
 * @route GET /tasks/:taskId
 * @param {string} req.params.taskId - ID of the task to retrieve
 * @param {Object} req.query - Query parameters
 * @param {boolean} [req.query.includeSubtasks] - Include subtasks in response
 * @param {boolean} [req.query.includeCompletedSubtasks] - Include completed subtasks
 * @returns {Promise<Task>} Task object
 * @throws {Error} 404 - Task not found
 * @throws {Error} 500 - Failed to retrieve task
 */
router.get("/tasks/:taskId", async (req, res) => {
  try {
    // Pass through all query parameters to Motion API
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
 * @param {string} req.params.taskId - ID of the task to update
 * @param {Object} req.body - Fields to update
 * @param {string} [req.body.title] - New title
 * @param {string} [req.body.description] - New description
 * @param {string} [req.body.status] - New status
 * @param {string} [req.body.dueDate] - New due date
 * @returns {Promise<Task>} Updated task object
 * @throws {Error} 404 - Task not found
 * @throws {Error} 500 - Failed to update task
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
 * @param {string} req.params.taskId - ID of the task to delete
 * @returns {Promise<void>} 200 - Task successfully deleted
 * @throws {Error} 404 - Task not found
 * @throws {Error} 500 - Failed to delete task
 */
router.delete("/tasks/:taskId", async (req, res) => {
  try {
    const response = await motionApi.delete(`/tasks/${req.params.taskId}`);
    res.json(response.data);
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to delete task",
    });
  }
});

/**
 * Unassign all users from a task
 * @route DELETE /tasks/:taskId/unassign
 * @param {string} req.params.taskId - ID of the task to unassign
 * @returns {Promise<Task>} Updated task object with empty assignees
 * @throws {Error} 404 - Task not found
 * @throws {Error} 500 - Failed to unassign task
 */
router.delete("/tasks/:taskId/unassign", async (req, res) => {
  try {
    const response = await motionApi.delete(
      `/tasks/${req.params.taskId}/unassign`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error unassigning task:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to unassign task",
    });
  }
});

/**
 * @typedef {Object} RecurringTask
 * @property {string} id - The unique identifier of the recurring task
 * @property {string} title - The title of the recurring task
 * @property {string} [description] - Optional description
 * @property {string} [projectId] - ID of the project this recurring task belongs to
 * @property {string} workspaceId - ID of the workspace this recurring task belongs to
 * @property {string} [priority] - Priority level of the recurring task
 * @property {string[]} [labels] - Array of labels assigned to the recurring task
 * @property {number} [estimate] - Estimated time in minutes
 * @property {Object} [customFields] - Custom fields for the recurring task
 * @property {Object} recurrence - Recurrence pattern settings
 */

/**
 * Retrieve all recurring tasks
 * @route GET /recurring-tasks
 * @returns {Promise<RecurringTask[]>} Array of recurring task objects
 * @throws {Error} 500 - Failed to fetch recurring tasks
 */
router.get("/recurring-tasks", async (req, res) => {
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

  try {
    const response = await motionApi.get("/recurring-tasks", {
      params: { workspaceId },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching recurring tasks:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to fetch recurring tasks",
    });
  }
});

/**
 * Create a new recurring task
 * @route POST /recurring-tasks
 * @param {Object} req.body - Recurring task creation parameters
 * @param {string} req.body.title - Title of the recurring task
 * @param {string} [req.body.description] - Description
 * @param {Object} req.body.recurrence - Recurrence pattern
 * @returns {Promise<RecurringTask>} Created recurring task object
 * @throws {Error} 500 - Failed to create recurring task
 */
router.post("/recurring-tasks", async (req, res) => {
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

  try {
    const response = await motionApi.post("/recurring-tasks", req.body, {
      params: { workspaceId },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error creating recurring task:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to create recurring task",
    });
  }
});

/**
 * Delete a recurring task
 * @route DELETE /recurring-tasks/:taskId
 * @param {string} req.params.taskId - ID of the recurring task to delete
 * @returns {Promise<void>} 200 - Recurring task successfully deleted
 * @throws {Error} 404 - Recurring task not found
 * @throws {Error} 500 - Failed to delete recurring task
 */
router.delete("/recurring-tasks/:taskId", async (req, res) => {
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

  try {
    const response = await motionApi.delete(
      `/recurring-tasks/${req.params.taskId}`,
      {
        params: { workspaceId },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error deleting recurring task:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to delete recurring task",
    });
  }
});

/**
 * @typedef {Object} Comment
 * @property {string} id - The unique identifier of the comment
 * @property {string} content - The content of the comment
 * @property {string} taskId - ID of the task this comment belongs to
 * @property {string} userId - ID of the user who created the comment
 * @property {string} createdAt - Creation timestamp
 */

/**
 * Retrieve all comments
 * @route GET /comments
 * @returns {Promise<Comment[]>} Array of comment objects
 * @throws {Error} 500 - Failed to fetch comments
 */
router.get("/comments", async (req, res) => {
  try {
    const response = await motionApi.get("/comments");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to fetch comments",
    });
  }
});

/**
 * Create a new comment
 * @route POST /comments
 * @param {Object} req.body - Comment creation parameters
 * @param {string} req.body.content - Content of the comment
 * @param {string} req.body.taskId - ID of the task to comment on
 * @returns {Promise<Comment>} Created comment object
 * @throws {Error} 404 - Task not found
 * @throws {Error} 500 - Failed to create comment
 */
router.post("/comments", async (req, res) => {
  try {
    const response = await motionApi.post("/comments", req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Error creating comment:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to create comment",
    });
  }
});

/**
 * @typedef {Object} Project
 * @property {string} id - The unique identifier of the project
 * @property {string} name - The name of the project
 * @property {string} [description] - Optional project description
 * @property {string} status - Current project status
 */

/**
 * Retrieve all projects
 * @route GET /projects
 * @returns {Promise<Project[]>} Array of project objects
 * @throws {Error} 500 - Failed to fetch projects
 */
router.get("/projects", async (req, res) => {
  try {
    const response = await motionApi.get("/projects");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to fetch projects",
    });
  }
});

/**
 * Retrieve a specific project
 * @route GET /projects/:projectId
 * @param {string} req.params.projectId - ID of the project to retrieve
 * @returns {Promise<Project>} Project object
 * @throws {Error} 404 - Project not found
 * @throws {Error} 500 - Failed to retrieve project
 */
router.get("/projects/:projectId", async (req, res) => {
  try {
    const response = await motionApi.get(`/projects/${req.params.projectId}`);
    res.json(response.data);
  } catch (error) {
    console.error("Error retrieving project:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to retrieve project",
    });
  }
});

/**
 * Create a new project
 * @route POST /projects
 * @param {Object} req.body - Project creation parameters
 * @param {string} req.body.name - Name of the project
 * @param {string} [req.body.description] - Project description
 * @returns {Promise<Project>} Created project object
 * @throws {Error} 500 - Failed to create project
 */
router.post("/projects", async (req, res) => {
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
 * @typedef {Object} User
 * @property {string} id - The unique identifier of the user
 * @property {string} email - User's email address
 * @property {string} name - User's full name
 * @property {string} [avatar] - URL to user's avatar image
 */

/**
 * Retrieve all users
 * @route GET /users
 * @returns {Promise<User[]>} Array of user objects
 * @throws {Error} 500 - Failed to fetch users
 */
router.get("/users", async (req, res) => {
  try {
    const response = await motionApi.get("/users");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to fetch users",
    });
  }
});

/**
 * Retrieve the current authenticated user's information
 * @route GET /users/me
 * @returns {Promise<User>} Current user object
 * @throws {Error} 401 - Unauthorized
 * @throws {Error} 500 - Failed to fetch current user
 */
router.get("/users/me", async (req, res) => {
  try {
    const response = await motionApi.get("/users/me");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching current user:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to fetch current user",
    });
  }
});

/**
 * @typedef {Object} Schedule
 * @property {string} id - The unique identifier of the schedule
 * @property {string} userId - ID of the user this schedule belongs to
 * @property {Object} availability - User's availability settings
 * @property {Object} preferences - User's scheduling preferences
 */

/**
 * Retrieve all schedules
 * @route GET /schedules
 * @returns {Promise<Schedule[]>} Array of schedule objects
 * @throws {Error} 500 - Failed to fetch schedules
 */
router.get("/schedules", async (req, res) => {
  try {
    const response = await motionApi.get("/schedules");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching schedules:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Failed to fetch schedules",
    });
  }
});

module.exports = router;
