/**
 * @file game.delete.test.ts
 * @description Integration tests for game deletion.
 * Tests admin-only game deletion and authorization.
 */
import request from "supertest";
import app from "../src/server";
import mongoose from "mongoose";
import User from "../src/models/user.model";
import { UserRole } from "../src/types/enums";
import Game from "../src/models/game.model";
import jwt from "jsonwebtoken";

describe("DELETE /api/games/:id", () => {
  let adminToken: string;
  let userToken: string;
  let gameId: string;

  beforeAll(async () => {
    // Create Admin
    const admin = await User.create({
      username: "admin_delete_test",
      email: "admin_delete@test.com",
      password: "password123",
      role: UserRole.ADMIN,
    });
    adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET as string
    );

    // Create User
    const user = await User.create({
      username: "user_delete_test",
      email: "user_delete@test.com",
      password: "password123",
      role: UserRole.USER,
    });
    userToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string
    );
  });

  afterAll(async () => {
    await User.deleteMany({ email: /_delete@test.com/ });
    await Game.deleteMany({ title: "Game to Delete" });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const game = await Game.create({
      title: "Game to Delete",
      genre: "Test",
      platform: "Test",
      developer: "Test Dev",
      publisher: "Test Pub",
    });
    gameId = game._id.toString();
  });

  afterEach(async () => {
    await Game.deleteMany({ title: "Game to Delete" });
  });

  it("should allow admin to delete a game", async () => {
    const res = await request(app)
      .delete(`/api/games/${gameId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Game deleted from catalog");

    const game = await Game.findById(gameId);
    expect(game).toBeNull();
  });

  it("should deny non-admin user to delete a game", async () => {
    const res = await request(app)
      .delete(`/api/games/${gameId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it("should return 404 if game not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/games/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
