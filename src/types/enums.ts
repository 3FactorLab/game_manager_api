/**
 * @file enums.ts
 * @description Centralized Enums for the application to avoid magic strings.
 */

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export enum GameStatus {
  PLAYING = "playing",
  COMPLETED = "completed",
  DROPPED = "dropped",
  PLAN_TO_PLAY = "plan_to_play",
  PENDING = "pending", // For purchased games not yet started
}

export enum OrderStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  REFUNDED = "refunded",
  FAILED = "failed",
}
