const app = require("../../../server");
const RateLimitHelper = require("../../helpers/rateLimitHelper");

const rateLimitHelper = new RateLimitHelper(11);
const agent = rateLimitHelper.createAgent(app);

describe("Motion API - Tasks Routes", () => {
  const workspaceId = process.env.MOTION_TEST_WORKSPACE_ID;
  let createdTaskId;
  let projectId;

  beforeAll(async () => {
    if (!process.env.MOTION_API_KEY || !process.env.MOTION_TEST_WORKSPACE_ID) {
      throw new Error(
        "Required environment variables MOTION_API_KEY and MOTION_TEST_WORKSPACE_ID must be set"
      );
    }

    // Get a project ID for task creation
    const projectsResponse = await agent
      .get("/motion/projects")
      .query({ workspaceId });

    if (projectsResponse.body.projects.length === 0) {
      const createProjectResponse = await agent.post("/motion/projects").send({
        name: "Test Project",
        description: "Created by automated test",
        workspaceId,
      });
      projectId = createProjectResponse.body.id;
    } else {
      projectId = projectsResponse.body.projects[0].id;
    }
  });

  describe("GET /tasks", () => {
    it("should return tasks when workspaceId is provided", async () => {
      const response = await agent.get("/motion/tasks").query({ workspaceId });
      expect(response.status).toBe(200);
      expect(response.body.tasks).toBeDefined();
      expect(Array.isArray(response.body.tasks)).toBe(true);
    });

    it("should return 400 when workspaceId is missing", async () => {
      const response = await agent.get("/motion/tasks");
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "workspaceId is required in query parameters"
      );
    });
  });

  describe("POST /tasks", () => {
    it("should create a new task", async () => {
      const taskData = {
        name: "Test Task",
        description: "Created by automated test",
        projectId: projectId,
        workspaceId,
      };

      const response = await agent.post("/motion/tasks").send(taskData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(taskData.name);
      createdTaskId = response.body.id;
    });

    it("should return 400 when required parameters are missing", async () => {
      const response = await agent.post("/motion/tasks").send({
        description: "Should fail without name and workspaceId",
      });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "name is required in request body"
      );
    });
  });

  describe("GET /tasks/:taskId", () => {
    it("should return a specific task", async () => {
      if (!createdTaskId) return;

      const response = await agent
        .get(`/motion/tasks/${createdTaskId}`)
        .query({ workspaceId });
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createdTaskId);
    });

    it("should return 404 for non-existent task", async () => {
      const response = await agent
        .get("/motion/tasks/nonexistent-id")
        .query({ workspaceId });
      expect(response.status).toBe(404);
    });

    it("should return 400 when workspaceId is missing", async () => {
      const response = await agent.get(`/motion/tasks/${createdTaskId}`);
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "workspaceId is required in query parameters"
      );
    });
  });

  describe("PATCH /tasks/:taskId", () => {
    it("should update a task", async () => {
      if (!createdTaskId) return;

      const updateData = {
        name: "Updated Test Task",
      };

      const response = await agent
        .patch(`/motion/tasks/${createdTaskId}`)
        .query({ workspaceId })
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
    });

    it("should return 400 when workspaceId is missing", async () => {
      const response = await agent
        .patch(`/motion/tasks/${createdTaskId}`)
        .send({ name: "Updated Task" });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "workspaceId is required in query parameters"
      );
    });
  });

  describe("DELETE /tasks/:taskId", () => {
    it("should delete a task", async () => {
      if (!createdTaskId) return;

      const response = await agent
        .delete(`/motion/tasks/${createdTaskId}`)
        .query({ workspaceId });
      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await agent
        .get(`/motion/tasks/${createdTaskId}`)
        .query({ workspaceId });
      expect(getResponse.status).toBe(404);
    });

    it("should return 400 when workspaceId is missing", async () => {
      const response = await agent.delete(`/motion/tasks/${createdTaskId}`);
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "workspaceId is required in query parameters"
      );
    });
  });
});
