/**
 * @file collection.routes.ts
 * @description Defines routes for user's personal game collection.
 * Includes Swagger documentation for each endpoint.
 */
import express from "express";
import {
  addToCollection,
  getCollection,
  updateItem,
  removeItem,
} from "../controllers/collection.controller";
import checkAuth from "../middleware/auth.middleware";
import {
  addToCollectionValidator,
  updateCollectionItemValidator,
} from "../validators/collection.validator";

const router = express.Router();

router.use(checkAuth);

/**
 * @swagger
 * /api/collection:
 *   get:
 *     summary: Get my game collection
 *     tags: [Collection]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (playing, completed, dropped, plan_to_play, pending)
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Filter by platform
 *     responses:
 *       200:
 *         description: List of user games
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
router.get("/", getCollection);

/**
 * @swagger
 * /api/collection:
 *   post:
 *     summary: Add a game to my collection
 *     tags: [Collection]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gameId]
 *             properties:
 *               gameId: { type: string }
 *               status:
 *                 type: string
 *                 enum: [playing, completed, dropped, plan_to_play, pending]
 *               hoursPlayed: { type: number }
 *               score: { type: number }
 *               review: { type: string }
 *     responses:
 *       201:
 *         description: Added to collection
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
router.post("/", addToCollectionValidator, addToCollection);

/**
 * @swagger
 * /api/collection/{id}:
 *   put:
 *     summary: Update collection item
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [playing, completed, dropped, plan_to_play, pending]
 *               hoursPlayed: { type: number }
 *               score: { type: number }
 *               review: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", updateCollectionItemValidator, updateItem);

/**
 * @swagger
 * /api/collection/{id}:
 *   delete:
 *     summary: Remove from collection
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Removed
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", checkAuth, removeItem);

export default router;
