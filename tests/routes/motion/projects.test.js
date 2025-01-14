const app = require("../../../server");
const RateLimitHelper = require("../../helpers/rateLimitHelper");

const rateLimitHelper = new RateLimitHelper(11);
const agent = rateLimitHelper.createAgent(app);

describe("Motion API - Projects Routes", () => {
  const workspaceId = process.env.MOTION_TEST_WORKSPACE_ID;
  let projectId;

  beforeAll(async () => {
    if (!process.env.MOTION_API_KEY || !process.env.MOTION_TEST_WORKSPACE_ID) {
      throw new Error(
        "Required environment variables MOTION_API_KEY and MOTION_TEST_WORKSPACE_ID must be set"
      );
    }
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

    it("should return 400 when workspaceId is missing", async () => {
      const response = await agent.get("/motion/projects");
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "workspaceId is required in query parameters"
      );
    });
  });

  describe("POST /projects", () => {
    it("should create a new project", async () => {
      const projectData = {
        name: "Test Project Creation",
        description: "Created by automated test case",
        workspaceId,
      };

      const response = await agent.post("/motion/projects").send(projectData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(projectData.name);
      expect(response.body.description).toBe(projectData.description);
      projectId = response.body.id;
    });

    it("should return 400 when workspaceId is missing", async () => {
      const projectData = {
        name: "Test Project",
        description: "Should fail without workspaceId",
      };

      const response = await agent.post("/motion/projects").send(projectData);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "workspaceId is required in request body"
      );
    });
  });

  describe("GET /projects/:projectId", () => {
    it("should return a specific project", async () => {
      const response = await agent
        .get(`/motion/projects/${projectId}`)
        .query({ workspaceId });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(projectId);
    });

    it("should return 404 for non-existent project", async () => {
      const response = await agent
        .get("/motion/projects/nonexistent-id")
        .query({ workspaceId });

      expect(response.status).toBe(404);
    });

    it("should return 400 when workspaceId is missing", async () => {
      const response = await agent.get(`/motion/projects/${projectId}`);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "workspaceId is required in query parameters"
      );
    });
  });
});
