import express from "express";
import {
  getSales,
  createNewSale,
  getSaleById,
  getAllSales,
  getAdminSales,
} from "../controllers/salescontroller.js";
import { validateToken } from "../middleware/validateToken.js"; // adjust path

const router = express.Router();

// Protect all sales routes with auth middleware
router.use(validateToken);

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Sales management
 */

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Get all sales
 *     tags: [Sales]
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: List of all sales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.post("/all", getAllSales);

/**
 * @swagger
 * /sales/by-id:
 *   get:
 *     summary: Get a sale by ID (via header)
 *     tags: [Sales]
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: header
 *         name: sale_id
 *         required: true
 *         description: Sale ID for lookup
 *         schema:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Sale details and sold products
 *       404:
 *         description: Sale not found
 */
router.get("/by-id", getSaleById);

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sale
 *               - products
 *             properties:
 *               sale:
 *                 type: object
 *                 properties:
 *                   admin_number:
 *                     type: string
 *                   admin_name:
 *                     type: string
 *                   total_price:
 *                     type: number
 *                   total_net_price:
 *                     type: number
 *                   profit:
 *                     type: number
 *                   sale_time:
 *                     type: string
 *                   sale_day:
 *                     type: integer
 *                   sales_month:
 *                     type: integer
 *                   sales_year:
 *                     type: integer
 *                   branch:
 *                     type: integer
 *                   shop_id:
 *                     type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_name:
 *                       type: string
 *                     amount:
 *                       type: integer
 *                     net_price:
 *                       type: number
 *                     sell_price:
 *                       type: number
 *                     productid:
 *                       type: string
 *                     shop_id:
 *                       type: string
 *                     sell_quantity:
 *                       type: integer
 *               shop_id:
 *                 type: string
 *               sale_date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sale created successfully
 *       400:
 *         description: Missing fields or invalid data
 *       500:
 *         description: Internal server error
 */
router.post("/", createNewSale);
router.post("/admin/sales",getAdminSales);

export default router;
