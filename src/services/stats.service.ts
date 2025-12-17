/**
 * @file stats.service.ts
 * @description Service responsible for aggregating global statistics.
 * Handles database queries to count users, games, and collections.
 */
import UserGame from "../models/userGame.model";
import User from "../models/user.model";
import Game from "../models/game.model";
import Order from "../models/order.model";
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

/**
 * Admin Dashboard Stats (Deep Analysis)
 */
export const getDashboardStatsService = async () => {
  // 1. General KPIs
  const totalUsers = await User.countDocuments();
  const totalGames = await Game.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Aggregate Revenue (Sum of 'totalAmount' in COMPLETED orders)
  const revenueAgg = await Order.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  // 2. Top 5 Best Selling Games (by Revenue)
  const topSellingGames = await Order.aggregate([
    { $match: { status: "completed" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.title", // Group by Title (Snapshot)
        gameId: { $first: "$items.game" },
        revenue: { $sum: "$items.price" },
        salesCount: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);

  // 3. Platform Distribution
  const platformDistribution = await Game.aggregate([
    { $unwind: "$platforms" },
    {
      $group: {
        _id: "$platforms",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  // 4. Sales Trend (Last 12 Months)
  const salesTrend = await Order.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: {
          $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalSales: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // 5. Most Popular in Libraries (Owned)
  // We need to lookup the game title since UserGame only has game ID
  const libraryStats = await UserGame.aggregate([
    { $match: { isOwned: true } },
    {
      $group: {
        _id: "$game",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "games",
        localField: "_id",
        foreignField: "_id",
        as: "gameDetails",
      },
    },
    { $unwind: "$gameDetails" },
    {
      $project: {
        title: "$gameDetails.title",
        count: 1,
      },
    },
  ]);

  return {
    kpis: {
      totalUsers,
      totalGames,
      totalOrders,
      totalRevenue,
    },
    topGames: topSellingGames.map((g: any) => ({
      title: g._id,
      revenue: g.revenue,
      sales: g.salesCount,
    })),
    platforms: platformDistribution.map((p: any) => ({
      name: p._id,
      count: p.count,
    })),
    salesTrend: salesTrend.map((t: any) => ({
      date: `${t._id.month}/${t._id.year}`,
      sales: t.totalSales,
      orders: t.orderCount,
    })),
    libraryStats: libraryStats.map((l: any) => ({
      title: l.title,
      count: l.count,
    })),
  };
};
