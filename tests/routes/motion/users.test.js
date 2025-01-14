const app = require("../../../server");
const RateLimitHelper = require("../../helpers/rateLimitHelper");

const rateLimitHelper = new RateLimitHelper(11);
const agent = rateLimitHelper.createAgent(app);

describe("Motion API - Users Routes", () => {
  const workspaceId = process.env.MOTION_TEST_WORKSPACE_ID;

  beforeAll(async () => {
    if (!process.env.MOTION_API_KEY || !process.env.MOTION_TEST_WORKSPACE_ID) {
      throw new Error(
        "Required environment variables MOTION_API_KEY and MOTION_TEST_WORKSPACE_ID must be set"
      );
    }
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

    it("should return 400 when workspaceId is missing", async () => {
      const response = await agent.get("/motion/users/me");
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe(
        "workspaceId is required in query parameters"
      );
    });
  });
});
