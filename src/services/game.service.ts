/**
 * @file game.service.ts
 * @description Manages the global game catalog. Handles searching, creating, and updating games.
 */
import Game, { IGame } from "../models/game.model";
import { AppError } from "../utils/AppError";
import mongoose from "mongoose";

// Search games with filters and pagination
// Destination: Used by GameController.search (src/controllers/game.controller.ts).
// Supports filtering by title (regex), genre, and platform.
// Implements pagination.
export const searchGames = async (
  query: string,
  page: number = 1,
  limit: number = 10,
  genre?: string,
  platform?: string
) => {
  // TODO: Fix Mongoose FilterQuery type import (currently failing with 'no exported member')
  const filter: any = {};
  if (query) filter.title = { $regex: query, $options: "i" };
  if (genre) filter.genre = genre;
  if (platform) filter.platform = platform;

  const skip = (page - 1) * limit;

  const games = await Game.find(filter).skip(skip).limit(limit);
  const total = await Game.countDocuments(filter);

  return {
    games,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// Create a game in the catalog (if not exists)
// Destination: Used by GameController.create (src/controllers/game.controller.ts).
// Checks for duplicates based on title and platform before creating.
export const createCatalogGame = async (
  gameData: Partial<IGame>
): Promise<IGame> => {
  const { title, platform } = gameData;

  // Verificar si ya existe
  const existingGame = await Game.findOne({ title, platform });
  if (existingGame) {
    return existingGame;
  }

  const game = new Game(gameData);
  return await game.save();
};

// Get game by ID
// Destination: Used by GameController.getOne and CollectionService.addToCollection.
export const getCatalogGameById = async (gameId: string): Promise<IGame> => {
  const game = await Game.findById(gameId);
  if (!game) throw new AppError("Game not found in catalog", 404);
  return game;
};

// Delete game from catalog
// Destination: Used by GameController.deleteGame (src/controllers/game.controller.ts).
export const deleteCatalogGame = async (
  gameId: string
): Promise<IGame | null> => {
  const deletedGame = await Game.findByIdAndDelete(gameId);
  if (!deletedGame)
    throw new AppError("Juego no encontrado en el catálogo", 404);
  return deletedGame;
};

// Update game in catalog
// Destination: Used by GameController.updateGame (src/controllers/game.controller.ts).
export const updateCatalogGame = async (
  gameId: string,
  gameData: Partial<IGame>
): Promise<IGame | null> => {
  const updatedGame = await Game.findByIdAndUpdate(gameId, gameData, {
    new: true,
  });
  if (!updatedGame)
    throw new AppError("Juego no encontrado en el catálogo", 404);
  return updatedGame;
};
