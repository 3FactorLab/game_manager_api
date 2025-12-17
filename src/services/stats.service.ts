/**
 * @file stats.service.ts
 * @description Service for calculating global and dashboard statistics.
 * Aggregates data from Users, Games, and Orders collections.
 */
import User from "../models/user.model";
import Game from "../models/game.model";
import Order from "../models/order.model";

/**
 * Public global stats (existing)
 */
export const getGlobalStats = async () => {
  const [totalUsers, totalGames, totalCollections] = await Promise.all([
    User.countDocuments(),
    Game.countDocuments(),
    // Roughly estimating collections by summing user libraries could be expensive,
    // so we might stick to public simple counts or cached values.
    // For now, let's keep it simple as implemented before or just return 0 if not tracked.
    Promise.resolve(0),
  ]);

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
  // We need to unwind items, then group by game title/id
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
  // Games have a "platforms" array of strings
  const platformDistribution = await Game.aggregate([
    { $unwind: "$platforms" },
    {
      $group: {
        _id: "$platforms",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    // Limit to top 6 to avoid clutter, label others as 'Other' if needed?
    // For now, let's just return top 8.
    { $limit: 8 },
  ]);

  return {
    kpis: {
      totalUsers,
      totalGames,
      totalOrders,
      totalRevenue,
    },
    topGames: topSellingGames.map((g) => ({
      title: g._id,
      revenue: g.revenue,
      sales: g.salesCount,
    })),
    platforms: platformDistribution.map((p) => ({
      name: p._id,
      count: p.count,
    })),
  };
};
