const request = require("supertest");
const app = require("../../server");
const RateLimitHelper = require("../helpers/rateLimitHelper");

const rateLimitHelper = new RateLimitHelper(11); // 11 requests per minute

// Wrap supertest requests with rate limiting
const agent = request(app);
const rateLimitedGet = rateLimitHelper.wrapWithRateLimit(agent.get.bind(agent));
const rateLimitedPost = rateLimitHelper.wrapWithRateLimit(
  agent.post.bind(agent)
);
const rateLimitedPatch = rateLimitHelper.wrapWithRateLimit(
  agent.patch.bind(agent)
);
const rateLimitedDelete = rateLimitHelper.wrapWithRateLimit(
  agent.delete.bind(agent)
);

describe("Motion API Routes", () => {
  const workspaceId = process.env.MOTION_TEST_WORKSPACE_ID;
  let createdTaskId;

  beforeAll(() => {
    // Ensure required env variables are set
    if (!process.env.MOTION_API_KEY || !process.env.MOTION_TEST_WORKSPACE_ID) {
      throw new Error(
        "Required environment variables MOTION_API_KEY and MOTION_TEST_WORKSPACE_ID must be set"
      );
    }
  });

  describe("GET /tasks", () => {
    it("should return tasks when workspaceId is provided", async () => {
      const response = await rateLimitedGet("/tasks").query({ workspaceId });
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return 400 when workspaceId is missing", async () => {
      const response = await rateLimitedGet("/tasks");
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe("workspaceId is required");
    });
  });

  describe("POST /tasks", () => {
    it("should create a new task", async () => {
      const taskData = {
        title: "Test Task",
        description: "Created by automated test",
        workspaceId,
      };

      const response = await rateLimitedPost("/tasks").send(taskData);
      expect(response.status).toBe(200);
      expect(response.body.title).toBe(taskData.title);
      createdTaskId = response.body.id; // Save for later tests
    });
  });

  describe("GET /tasks/:taskId", () => {
    it("should return a specific task", async () => {
      // Skip if no task was created
      if (!createdTaskId) {
        return;
      }

      const response = await rateLimitedGet(`/tasks/${createdTaskId}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdTaskId);
    });

    it("should return 404 for non-existent task", async () => {
      const response = await rateLimitedGet("/tasks/nonexistent-id");
      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /tasks/:taskId", () => {
    it("should update a task", async () => {
      // Skip if no task was created
      if (!createdTaskId) {
        return;
      }

      const updateData = {
        title: "Updated Test Task",
      };

      const response = await rateLimitedPatch(`/tasks/${createdTaskId}`).send(
        updateData
      );
      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
    });
  });

  describe("DELETE /tasks/:taskId", () => {
    it("should delete a task", async () => {
      // Skip if no task was created
      if (!createdTaskId) {
        return;
      }

      const response = await rateLimitedDelete(`/tasks/${createdTaskId}`);
      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await rateLimitedGet(`/tasks/${createdTaskId}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe("GET /projects", () => {
    it("should return projects", async () => {
      const response = await rateLimitedGet("/projects");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /users/me", () => {
    it("should return current user info", async () => {
      const response = await rateLimitedGet("/users/me");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("email");
    });
  });
});
