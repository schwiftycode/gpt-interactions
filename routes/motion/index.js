/**
 * @fileoverview Main router for Motion API routes
 */

const express = require("express");
const router = express.Router();

// Import route handlers
const tasksRouter = require("./tasks");
const projectsRouter = require("./projects");
const usersRouter = require("./users");

// Mount routes
router.use("/tasks", tasksRouter);
router.use("/projects", projectsRouter);
router.use("/users", usersRouter);

module.exports = router;
