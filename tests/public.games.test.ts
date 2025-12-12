/**
 * @file public.games.test.ts
 * @description Integration tests for public game API endpoints.
 */
import request from "supertest";
import app from "../src/server";
import { Game } from "../src/models";

describe("Public Games Integration Tests", () => {
  let gameId: string;

  beforeAll(async () => {
    // Clean up potentially conflicting data
    await Game.deleteMany({ title: "Public Game Test" });

    // Create a public game
    const game = await Game.create({
      title: "Public Game Test",
      genre: "Adventure",
      platform: "PC",
      developer: "Public Dev",
      publisher: "Public Pub",
      released: new Date(),
      description: "A game for testing public access",
      rawgId: 99999,
      steamAppId: 99999,
      price: 19.99,
      currency: "USD",
    });
    gameId = game._id.toString();
  });

  afterAll(async () => {
    await Game.findByIdAndDelete(gameId);
  });

  describe("GET /api/public/games", () => {
    it("should return a list of games without authentication", async () => {
      // Use query to ensure our game is found even if DB has many items
      const res = await request(app)
        .get("/api/public/games")
        .query({ query: "Public Game Test" });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.games)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(1);

      const found = res.body.games.find((g: any) => g._id === gameId);
      expect(found).toBeTruthy();
      expect(found.title).toBe("Public Game Test");
    });

    it("should support pagination", async () => {
      const res = await request(app)
        .get("/api/public/games")
        .query({ page: 1, limit: 1 });

      expect(res.status).toBe(200);
      expect(res.body.games.length).toBeLessThanOrEqual(1);
    });

    it("should support filtering by query", async () => {
      const res = await request(app)
        .get("/api/public/games")
        .query({ query: "Public Game" });

      expect(res.status).toBe(200);
      const found = res.body.games.find((g: any) => g._id === gameId);
      expect(found).toBeTruthy();
    });
  });

  describe("GET /api/public/games/:id", () => {
    it("should return game details without authentication", async () => {
      const res = await request(app).get(`/api/public/games/${gameId}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(gameId);
      expect(res.body.title).toBe("Public Game Test");
    });

    it("should return 404 for non-existent game", async () => {
      const fakeId = "000000000000000000000000";
      const res = await request(app).get(`/api/public/games/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });
});
