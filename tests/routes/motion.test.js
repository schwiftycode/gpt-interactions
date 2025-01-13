const app = require("../../server");
const RateLimitHelper = require("../helpers/rateLimitHelper");

const rateLimitHelper = new RateLimitHelper(11); // 11 requests per minute
const agent = rateLimitHelper.createAgent(app);

describe("Motion API Routes", () => {
  const workspaceId = process.env.MOTION_TEST_WORKSPACE_ID;
  let createdTaskId;
  let projectId;

  beforeAll(async () => {
    // Ensure required env variables are set
    if (!process.env.MOTION_API_KEY || !process.env.MOTION_TEST_WORKSPACE_ID) {
      throw new Error(
        "Required environment variables MOTION_API_KEY and MOTION_TEST_WORKSPACE_ID must be set"
      );
    }

    // Get a project ID for task creation
    const projectsResponse = await agent
      .get("/motion/projects")
      .query({ workspaceId });

    console.log(
      "Projects Response:",
      JSON.stringify(projectsResponse.body, null, 2)
    );

    expect(projectsResponse.status).toBe(200);
    expect(projectsResponse.body.projects).toBeDefined();
    expect(Array.isArray(projectsResponse.body.projects)).toBe(true);

    // Create a project if none exist
    if (projectsResponse.body.projects.length === 0) {
      const createProjectResponse = await agent
        .post("/motion/projects")
        .query({ workspaceId })
        .send({
          name: "Test Project",
          description: "Created by automated test",
        });
      expect(createProjectResponse.status).toBe(200);
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
      expect(response.body.error.message).toBe("workspaceId is required");
    });
  });

  describe("POST /tasks", () => {
    it("should create a new task", async () => {
      const taskData = {
        name: "Test Task",
        description: "Created by automated test",
        projectId: projectId,
      };

      const response = await agent
        .post("/motion/tasks")
        .query({ workspaceId })
        .send(taskData);

      if (response.status !== 200) {
        console.log("Task Creation Error:", response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(taskData.name);
      createdTaskId = response.body.id; // Save for later tests
    });
  });

  describe("GET /tasks/:taskId", () => {
    it("should return a specific task", async () => {
      // Skip if no task was created
      if (!createdTaskId) {
        return;
      }

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
  });

  describe("PATCH /tasks/:taskId", () => {
    it("should update a task", async () => {
      // Skip if no task was created
      if (!createdTaskId) {
        return;
      }

      const updateData = {
        name: "Updated Test Task",
      };

      const response = await agent
        .patch(`/motion/tasks/${createdTaskId}`)
        .query({ workspaceId })
        .send(updateData);

      if (response.status !== 200) {
        console.log("Task Update Error:", response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
    });
  });

  describe("DELETE /tasks/:taskId", () => {
    it("should delete a task", async () => {
      // Skip if no task was created
      if (!createdTaskId) {
        return;
      }

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
  });

  describe("GET /projects", () => {
    it("should return projects", async () => {
      const response = await agent
        .get("/motion/projects")
        .query({ workspaceId });
      expect(response.status).toBe(200);
      expect(response.body.projects).toBeDefined();
      expect(Array.isArray(response.body.projects)).toBe(true);
    });
  });

  describe("GET /users/me", () => {
    it("should return current user info", async () => {
      const response = await agent
        .get("/motion/users/me")
        .query({ workspaceId });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("email");
    });
  });
});
