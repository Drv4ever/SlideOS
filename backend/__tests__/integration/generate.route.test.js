import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../app.js";
import generateRoutes from "../../src/routes/generate.route.js";

app.use("/api/generate", generateRoutes);

describe("POST /api/generate", () => {
  let authToken;

  beforeAll(() => {
    authToken = jwt.sign({ id: "test-user-id" }, process.env.JWT_SECRET);
  });

  describe("authentication", () => {
    test("should return 401 when no auth token is provided", async () => {
      const res = await request(app)
        .post("/api/generate")
        .send({
          prompt: "Test",
          slides: 3,
          textAmount: "detailed",
          theme: "cornflower",
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "No token provided");
    });

    test("should return 401 when auth token is invalid", async () => {
      const res = await request(app)
        .post("/api/generate")
        .set("Authorization", "Bearer invalid-token")
        .send({
          prompt: "Test",
          slides: 3,
          textAmount: "detailed",
          theme: "cornflower",
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("with auth token", () => {
    test("should return 400 for missing prompt", async () => {
      const res = await request(app)
        .post("/api/generate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          slides: 3,
          textAmount: "detailed",
          theme: "cornflower",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, error: "Prompt is required" });
    });

    test("should return 400 for invalid slides count", async () => {
      const res = await request(app)
        .post("/api/generate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          prompt: "Test",
          slides: 0,
          textAmount: "detailed",
          theme: "cornflower",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, error: "Slides must be between 1 and 20" });
    });

    test("should return 400 for invalid textAmount", async () => {
      const res = await request(app)
        .post("/api/generate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          prompt: "Test",
          slides: 3,
          textAmount: "invalid",
          theme: "cornflower",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, error: "Invalid text amount" });
    });

    test("should return 400 for missing theme", async () => {
      const res = await request(app)
        .post("/api/generate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          prompt: "Test",
          slides: 3,
          textAmount: "detailed",
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, error: "Theme is required" });
    });
  });
});
