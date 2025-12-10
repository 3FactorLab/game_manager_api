/**
 * @file user.controller.ts
 * @description Controller for user-specific operations like wishlist management.
 */
import { Request, Response } from "express";
import User from "../models/user.model";
import Game from "../models/game.model";

/**
 * Add a game to the user's wishlist
 * @route POST /api/users/wishlist/:gameId
 */
export const addToWishlist = async (req: Request, res: Response) => {
    try {
        const { gameId } = req.params;
        const userId = req.userData?.id;
        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        // Check if game exists
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: "Game not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if already in wishlist
        if (user.wishlist.includes(gameId as any)) {
            return res.status(400).json({ message: "Game already in wishlist" });
        }

        user.wishlist.push(gameId as any);
        await user.save();

        res.status(200).json({ message: "Game added to wishlist", wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: "Error adding to wishlist", error });
    }
};

/**
 * Remove a game from the user's wishlist
 * @route DELETE /api/users/wishlist/:gameId
 */
export const removeFromWishlist = async (req: Request, res: Response) => {
    try {
        const { gameId } = req.params;
        const userId = req.userData?.id;
        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.wishlist = user.wishlist.filter((id) => id.toString() !== gameId);
        await user.save();

        res.status(200).json({ message: "Game removed from wishlist", wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: "Error removing from wishlist", error });
    }
};

/**
 * Get user's wishlist
 * @route GET /api/users/wishlist
 */
export const getWishlist = async (req: Request, res: Response) => {
    try {
        const userId = req.userData?.id;
        if (!userId) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const user = await User.findById(userId).populate("wishlist");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: "Error fetching wishlist", error });
    }
};
