import express from "express";
import { 
    highStockProducts, 
    MainFinance,
    lowStockProducts, 
    getDayStatistics, 
    getWeekStatistics 
} from "../controllers/statisticscontroller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Finance
 *   description: Financial statistics and product stock analytics
 */

/**
 * @swagger
 * /statistics/finance/main:
 *   get:
 *     summary: Get total finance statistics (overall + today)
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: Successfully fetched finance data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     sale:
 *                       type: number
 *                       example: 1500000
 *                     net_sale:
 *                       type: number
 *                       example: 1200000
 *                     profit:
 *                       type: number
 *                       example: 300000
 *                     today:
 *                       type: object
 *                       properties:
 *                         sale:
 *                           type: number
 *                           example: 200000
 *                         net_sale:
 *                           type: number
 *                           example: 160000
 *                         profit:
 *                           type: number
 *                           example: 40000
 *       500:
 *         description: Server error
 */
router.get("/finance/main", MainFinance);

/**
 * @swagger
 * /statistics/high-stock:
 *   get:
 *     summary: Get top 5 most sold products (high stock difference)
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: Successfully fetched high stock products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
router.get("/high-stock", highStockProducts);

/**
 * @swagger
 * /statistics/low-stock:
 *   get:
 *     summary: Get top 5 lowest sold products (low stock difference)
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: Successfully fetched low stock products
 *       500:
 *         description: Server error
 */
router.get("/low-stock", lowStockProducts);

/**
 * @swagger
 * /statistics/day-stats:
 *   get:
 *     summary: Get finance statistics for a specific day
 *     tags: [Finance]
 *     parameters:
 *       - in: header
 *         name: day
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *       - in: header
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *       - in: header
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2025
 *     responses:
 *       200:
 *         description: Day statistics fetched successfully
 *       400:
 *         description: Missing day, month or year
 *       500:
 *         description: Server error
 */
router.get("/day-stats", getDayStatistics);

/**
 * @swagger
 * /statistics/graph-weekly:
 *   get:
 *     summary: Get last 7 days finance statistics (for graphs)
 *     tags: [Finance]
 *     responses:
 *       200:
 *         description: Returns array of last 7 days statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       day:
 *                         type: integer
 *                         example: 2
 *                       month:
 *                         type: integer
 *                         example: 12
 *                       year:
 *                         type: integer
 *                         example: 2025
 *                       total_sale:
 *                         type: number
 *                         example: 150000
 *                       net_sale:
 *                         type: number
 *                         example: 120000
 *                       profit:
 *                         type: number
 *                         example: 30000
 *       500:
 *         description: Server error
 */
router.get("/graph-weekly", getWeekStatistics);

export default router;
