/**
 * @file user.delete.test.ts
 * @description Integration tests for user deletion.
 * Tests admin-only user deletion and authorization.
 */
import request from "supertest";
import app from "../src/server";
import mongoose from "mongoose";
import User from "../src/models/user.model";
import { UserRole } from "../src/types/enums";
import jwt from "jsonwebtoken";

describe("DELETE /api/users/:id", () => {
  let adminToken: string;
  let userToken: string;
  let targetUserId: string;

  beforeAll(async () => {
    // Create Admin
    const admin = await User.create({
      username: "admin_user_delete_test",
      email: "admin_user_delete@test.com",
      password: "password123",
      role: UserRole.ADMIN,
    });
    adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET as string
    );

    // Create User (Caller)
    const user = await User.create({
      username: "user_user_delete_test",
      email: "user_user_delete@test.com",
      password: "password123",
      role: UserRole.USER,
    });
    userToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string
    );
  });

  afterAll(async () => {
    await User.deleteMany({ email: /_user_delete@test.com/ });
    await User.deleteMany({ email: "target_user@test.com" });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const targetUser = await User.create({
      username: "target_user",
      email: "target_user@test.com",
      password: "password123",
      role: UserRole.USER,
    });
    targetUserId = targetUser._id.toString();
  });

  afterEach(async () => {
    await User.deleteMany({ email: "target_user@test.com" });
  });

  it("should allow admin to delete a user", async () => {
    const res = await request(app)
      .delete(`/api/users/${targetUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");

    const user = await User.findById(targetUserId);
    expect(user).toBeNull();
  });

  it("should deny non-admin user to delete a user", async () => {
    const res = await request(app)
      .delete(`/api/users/${targetUserId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it("should return 404 if user not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
