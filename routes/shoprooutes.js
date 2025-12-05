import express from "express";
const router = express.Router();
import { getShops } from "../controllers/shopcontrollers.js";

/**
 * @swagger
 * tags:
 *   - name: Shops
 *     description: Shop management endpoints
 */

/**
 * @swagger
 * /shops:
 *   get:
 *     summary: Get all shops
 *     tags:
 *       - Shops
 *     security:
 *       - secretKeyAuth: []     # <--- CUSTOM HEADER AUTH
 *     parameters:
 *       - in: header
 *         name: secret_key
 *         required: true
 *         schema:
 *           type: string
 *         description: CTO secret key
 *     responses:
 *       200:
 *         description: List of shops
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
router.get("/", getShops);

export default router;
