/**
 * @file auth.service.test.ts
 * @description Unit tests for authentication service.
 * Tests password hashing and user registration logic.
 */
import { jest } from "@jest/globals";
import bcrypt from "bcrypt";
import User from "../src/models/user.model";
import { registerUser } from "../src/services/auth.service";

// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock User model
jest.mock("../src/models/user.model");

describe("Auth Service - registerUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should hash the password and save the user", async () => {
    // A. ARRANGE
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };

    // Configure what the mocks return
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password" as never);

    // Mock save method
    const mockSave = jest
      .fn()
      .mockResolvedValue({ _id: "id_falso_123", ...userData } as never);
    (User as unknown as jest.Mock).mockImplementation(() => ({
      save: mockSave,
    }));

    // B. ACT
    const result = await registerUser(userData);

    // C. ASSERT
    // Was hash called with the correct password?
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

    // Was the user created with the correct data?
    expect(User).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
      password: "hashed_password",
      role: "user",
    });

    // Was it saved to the DB (simulated)?
    expect(mockSave).toHaveBeenCalled();
  });
});
