/**
 * @file userGame.model.ts
 * @description Mongoose model for user's personal game collection.
 * Links users to games with personal metadata (status, score, review).
 */
import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user.model";
import { IGame } from "./game.model";
import { GameStatus } from "../types/enums";

export { GameStatus }; // Re-export for backward compatibility if needed

export interface IUserGame extends Document {
  user: IUser["_id"];
  game: IGame["_id"];
  hoursPlayed: number;
  status: GameStatus;
  isFavorite: boolean;
  score?: number;
  review?: string;
  isOwned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userGameSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
    hoursPlayed: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(GameStatus),
      default: GameStatus.PENDING,
    },
    isFavorite: { type: Boolean, default: false },
    score: { type: Number, min: 0, max: 10 },
    review: { type: String },
    isOwned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from having the same game twice in their collection
userGameSchema.index({ user: 1, game: 1 }, { unique: true });

const UserGame = mongoose.model<IUserGame>("UserGame", userGameSchema);

export default UserGame;
