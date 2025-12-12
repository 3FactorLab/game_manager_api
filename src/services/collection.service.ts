/**
 * @file collection.service.ts
 * @description Manages the user's personal game collection.
 * Links users to games and stores personal metadata (score, status, review).
 */
import mongoose from "mongoose";
import UserGame, { IUserGame } from "../models/userGame.model";
import { getCatalogGameById } from "./game.service";
import { AppError } from "../utils/AppError";

// Add game to collection
// Destination: Used by CollectionController.addToCollection (src/controllers/collection.controller.ts).
// Verifies game existence and prevents duplicates in user's collection.
export const addToCollection = async (
  userId: string,
  gameId: string,
  collectionData: Partial<IUserGame>
): Promise<IUserGame> => {
  // Verificar que el juego existe en el catálogo
  await getCatalogGameById(gameId);

  // Verificar si ya lo tiene
  const existing = await UserGame.findOne({ user: userId, game: gameId });
  if (existing) throw new AppError("El juego ya está en tu colección", 400);

  return await UserGame.create({
    user: userId,
    game: gameId,
    ...collectionData,
  });
};

// Get user collection
// Destination: Used by CollectionController.getCollection (src/controllers/collection.controller.ts).
// Uses MongoDB Aggregation Pipeline to join UserGames with Games.
// Allows filtering by fields from both collections.
export const getCollection = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  status?: string,
  genre?: string,
  platform?: string
) => {
  const skip = (page - 1) * limit;

  // TODO: Fix Mongoose FilterQuery type import
  const filter: any = {
    user: new mongoose.Types.ObjectId(userId),
  };
  if (status) filter.status = status;

  // Para filtrar por campos del juego populado, necesitamos usar aggregate o filtrar después.
  // Mongoose populate 'match' filtra los juegos, pero no elimina el documento UserGame (deja game: null).
  // La mejor opción eficiente es usar aggregate.

  const pipeline: any[] = [
    { $match: filter }, // Filtra por user y status
    {
      $lookup: {
        from: "games",
        localField: "game",
        foreignField: "_id",
        as: "game",
      },
    },
    { $unwind: "$game" },
  ];

  if (genre) pipeline.push({ $match: { "game.genre": genre } });
  if (platform) pipeline.push({ $match: { "game.platform": platform } });

  // Contar total antes de paginar
  const countPipeline = [...pipeline, { $count: "total" }];
  const totalResult = await UserGame.aggregate(countPipeline);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;

  // Ordenar por fecha de actualización (más recientes primero)
  pipeline.push({ $sort: { updatedAt: -1 } });

  // Paginar
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  const items = await UserGame.aggregate(pipeline);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// Update collection item
// Destination: Used by CollectionController.updateItem (src/controllers/collection.controller.ts).
export const updateCollectionItem = async (
  itemId: string,
  userId: string,
  updateData: Partial<IUserGame>
): Promise<IUserGame> => {
  const item = await UserGame.findOneAndUpdate(
    { _id: itemId, user: userId },
    updateData,
    { new: true }
  ).populate("game");

  if (!item) throw new AppError("Item no encontrado en tu colección", 404);
  return item;
};

// Remove from collection
// Destination: Used by CollectionController.removeItem (src/controllers/collection.controller.ts).
export const removeFromCollection = async (
  itemId: string,
  userId: string
): Promise<IUserGame> => {
  const item = await UserGame.findOneAndDelete({ _id: itemId, user: userId });
  if (!item) throw new AppError("Item not found in your collection", 404);
  return item;
};
