import request from "supertest";
import app from "../src/server";
import Game from "../src/models/game.model";
import mongoose from "mongoose";

describe("Public Games API", () => {
  beforeAll(async () => {
    // Clear ONLY test data - scoped deletion to protect existing games
    if (process.env.NODE_ENV === "test") {
      await Game.deleteMany({
        title: {
          $in: ["Cyberpunk 2077", "The Witcher 3", "Stardew Valley", "Celeste"],
        },
      });
    }

    // Seed test data
    await Game.create([
      {
        title: "Cyberpunk 2077",
        genre: "RPG",
        platform: "PC",
        developer: "CD Projekt Red",
        publisher: "CD Projekt",
        price: 59.99,
        prices: { usd: 59.99 },
        releaseDate: new Date("2020-12-10"),
      },
      {
        title: "The Witcher 3",
        genre: "RPG",
        platform: "PS5",
        developer: "CD Projekt Red",
        publisher: "CD Projekt",
        price: 39.99,
        prices: { usd: 39.99 },
        releaseDate: new Date("2015-05-19"),
      },
      {
        title: "Stardew Valley",
        genre: "Simulation",
        platform: "Switch",
        developer: "ConcernedApe",
        publisher: "ConcernedApe",
        price: 14.99,
        prices: { usd: 14.99 },
        releaseDate: new Date("2016-02-26"),
      },
      {
        title: "Celeste",
        genre: "Platformer",
        platform: "Switch",
        developer: "Maddy Makes Games",
        publisher: "Maddy Makes Games",
        price: 19.99,
        prices: { usd: 19.99 },
        releaseDate: new Date("2018-01-25"),
      },
    ]);
  });

  afterAll(async () => {
    // Clean up ONLY test data - scoped deletion
    if (process.env.NODE_ENV === "test") {
      await Game.deleteMany({
        title: {
          $in: ["Cyberpunk 2077", "The Witcher 3", "Stardew Valley", "Celeste"],
        },
      });
    }
    await mongoose.connection.close();
  });

  describe("GET /api/public/games", () => {
    it("should return paginated games", async () => {
      const res = await request(app).get("/api/public/games?page=1&limit=2");
      expect(res.status).toBe(200);
      expect(res.body.games).toHaveLength(2);
      expect(res.body.totalPages).toBe(2);
      expect(res.body.total).toBe(4);
    });

    it("should search functionality (title)", async () => {
      const res = await request(app).get("/api/public/games?query=Cyber");
      expect(res.status).toBe(200);
      expect(res.body.games).toHaveLength(1);
      expect(res.body.games[0].title).toBe("Cyberpunk 2077");
    });

    it("should search functionality (multi-field: developer)", async () => {
      const res = await request(app).get(
        "/api/public/games?query=ConcernedApe"
      );
      expect(res.status).toBe(200);
      expect(res.body.games).toHaveLength(1);
      expect(res.body.games[0].title).toBe("Stardew Valley");
    });

    it("should filter by genre", async () => {
      const res = await request(app).get("/api/public/games?genre=RPG");
      expect(res.status).toBe(200);
      expect(res.body.games).toHaveLength(2);
    });

    it("should sort by price asc", async () => {
      const res = await request(app).get(
        "/api/public/games?sortBy=price&order=asc&limit=10"
      );
      expect(res.status).toBe(200);
      expect(res.body.games[0].price).toBe(14.99); // Stardew Valley
      expect(res.body.games[3].price).toBe(59.99); // Cyberpunk 2077
    });

    it("should sort by price desc", async () => {
      const res = await request(app).get(
        "/api/public/games?sortBy=price&order=desc&limit=10"
      );
      expect(res.status).toBe(200);
      expect(res.body.games[0].price).toBe(59.99); // Cyberpunk 2077
    });
  });

  describe("GET /api/public/games/filters", () => {
    it("should return available filters", async () => {
      const res = await request(app).get("/api/public/games/filters");
      expect(res.status).toBe(200);
      expect(res.body.genres).toContain("RPG");
      expect(res.body.genres).toContain("Simulation");
      expect(res.body.platforms).toContain("PC");
      expect(res.body.platforms).toContain("Switch");
    });
  });
});
