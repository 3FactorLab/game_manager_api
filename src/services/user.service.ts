/**
 * @file user.service.ts
 * @description Service layer for User operations.
 * Handles business logic for wishlist management and user data retrieval.
 * strictly decouples DB operations from HTTP controllers.
 */

import { Types } from "mongoose";
import User, { IUser } from "../models/user.model";
import Game from "../models/game.model";
import { AppError } from "../utils/AppError";
import { WishlistResponseDto } from "../dtos/user.dto";

/**
 * Adds a game to the user's wishlist.
 * Checks for existence of User and Game, and prevents duplicates.
 *
 * @param userId - The ID of the user
 * @param gameId - The ID of the game to add
 * @returns {Promise<WishlistResponseDto>} Updated wishlist
 * @throws {AppError} If user/game not found or already in wishlist
 */
export const addToWishlist = async (
  userId: string,
  gameId: string
): Promise<WishlistResponseDto> => {
  // 1. Validate User
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 2. Validate Game (Ensure it exists in catalog)
  const game = await Game.findById(gameId);
  if (!game) {
    throw new AppError("Game not found", 404);
  }

  // 3. Check for duplicates
  // Using string comparison for safety with ObjectIds
  const isAlreadyAdded = user.wishlist.some(
    (id) => id.toString() === gameId.toString()
  );

  if (isAlreadyAdded) {
    throw new AppError("Game already in wishlist", 400);
  }

  // 4. Update Wishlist
  user.wishlist.push(new Types.ObjectId(gameId));
  await user.save();

  return {
    message: "Game added to wishlist",
    wishlist: user.wishlist,
  };
};

/**
 * Removes a game from the user's wishlist.
 *
 * @param userId - The ID of the user
 * @param gameId - The ID of the game to remove
 * @returns {Promise<WishlistResponseDto>} Updated wishlist
 * @throws {AppError} If user not found
 */
export const removeFromWishlist = async (
  userId: string,
  gameId: string
): Promise<WishlistResponseDto> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Filter out the game
  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== gameId.toString()
  );

  await user.save();

  return {
    message: "Game removed from wishlist",
    wishlist: user.wishlist,
  };
};

/**
 * Retrieves the user's wishlist.
 * Populates the game details.
 *
 * @param userId - The ID of the user
 * @returns {Promise<any>} Populated wishlist (Game objects)
 * @throws {AppError} If user not found
 */
export const getWishlist = async (userId: string): Promise<any> => {
  const user = await User.findById(userId).populate("wishlist");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user.wishlist;
};
