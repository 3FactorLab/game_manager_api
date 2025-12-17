/**
 * @file stats.routes.ts
 * @description Routes definition for public statistics endpoints.
 */
import express from "express";
import { getStats } from "../controllers/stats.controller";

const router = express.Router();

/**
 * @swagger
 * /api/public/stats:
 *   get:
 *     summary: Get global site statistics
 *     description: Returns counts of total users, games, and collections (UserGames).
 *     tags: [Public Stats]
 *     responses:
 *       200:
 *         description: Global statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   example: 1250
 *                 totalGames:
 *                   type: integer
 *                   example: 15400
 *                 totalCollections:
 *                   type: integer
 *                   example: 45000
 *       500:
 *         description: Server error
 */
router.get("/", getStats);

export default router;
