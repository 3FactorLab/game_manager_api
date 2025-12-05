/**
 * @file game.model.ts
 * @description Mongoose model for the global game catalog.
 * Defines the schema and interface for game entities.
 */
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IGame {
  _id: Types.ObjectId;
  title: string;
  genre: string;
  platform: string;
  developer?: string;
  publisher?: string;
  image?: string;
  score?: number;
  // RAWG API fields
  rawgId?: number;
  description?: string;
  released?: Date;
  metacritic?: number;
  screenshots?: string[];
  // Steam API fields
  steamAppId?: number;
  price?: number;
  currency?: string;
  discount?: number;
  onSale?: boolean;
  originalPrice?: number;
  prices?: {
    usd?: number;
    eur?: number;
  };
  originalPrices?: {
    usd?: number;
    eur?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type GameDocument = IGame & Document;

const gameSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    developer: {
      type: String,
      required: false,
      trim: true,
    },
    publisher: {
      type: String,
      required: false,
      trim: true,
    },
    image: {
      type: String,
      required: false,
      trim: true,
    },
    score: {
      type: Number,
      required: false,
      min: 0,
      max: 10,
    },
    // RAWG API fields
    rawgId: {
      type: Number,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    released: {
      type: Date,
      required: false,
    },
    metacritic: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    screenshots: {
      type: [String],
      required: false,
      default: [],
    },
    // Steam API fields
    steamAppId: {
      type: Number,
      required: false,
    },
    price: {
      type: Number,
      required: false,
      min: 0,
    },
    currency: {
      type: String,
      required: false,
    },
    discount: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    onSale: {
      type: Boolean,
      required: false,
      default: false,
    },
    originalPrice: {
      type: Number,
      required: false,
      min: 0,
    },
    // Multi-currency support
    prices: {
      usd: { type: Number, required: false },
      eur: { type: Number, required: false },
    },
    originalPrices: {
      usd: { type: Number, required: false },
      eur: { type: Number, required: false },
    },
  },
  {
    timestamps: true,
  }
);

// Evitar duplicados en el catálogo (mismo título y plataforma)
gameSchema.index({ title: 1, platform: 1 }, { unique: true });

const Game = mongoose.model<GameDocument>("Game", gameSchema);

export default Game;
