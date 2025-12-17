/**
 * @file discovery.routes.ts
 * @description Routes for the Unified Search (Discovery) module.
 */
import { Router } from "express";
import { search } from "../controllers/discovery.controller";

const router = Router();

/**
 * @route GET /api/discovery
 * @desc Search games in both Local and Remote catalogs
 * @access Public
 */
router.get("/", search);

export default router;
