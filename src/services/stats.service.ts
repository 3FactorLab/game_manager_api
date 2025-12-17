/**
 * @file stats.service.ts
 * @description Service responsible for aggregating global statistics.
 * Handles database queries to count users, games, and collections.
 */
import User from "../models/user.model";
import Game from "../models/game.model";
import UserGame from "../models/userGame.model";
import { StatsResponseDto } from "../dtos/stats.dto";
import logger from "../utils/logger";

/**
 * getGlobalStats
 * Aggregates global counts for users, games, and collections.
 *
 * @returns {Promise<StatsResponseDto>} The aggregated statistics.
 */
export const getGlobalStats = async (): Promise<StatsResponseDto> => {
  logger.info("StatsService: Fetching global statistics");

  const [totalUsers, totalGames, totalCollections] = await Promise.all([
    User.countDocuments(),
    Game.countDocuments(),
    UserGame.countDocuments(),
  ]);

  logger.info(
    `StatsService: Stats fetched - Users: ${totalUsers}, Games: ${totalGames}, Collections: ${totalCollections}`
  );

  return {
    totalUsers,
    totalGames,
    totalCollections,
  };
};
