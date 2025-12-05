import express from 'express';
import {
  createNewProduct,
  deleteProduct,
  getProducts,
  getShopProducts,
  getSingleProduct,
  restockProduct,
  updateProduct,
} from '../controllers/productscontroller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management and operations
 */

/**
 * @swagger
 * /product/all:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Internal server error
 */
router.get('/all', getProducts);

/**
 * @swagger
 * /product/one:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Product]
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Missing ID
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/one', getSingleProduct);

/**
 * @swagger
 * /product:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *               - brand_id
 *               - scale
 *               - availability
 *               - total
 *               - net_price
 *               - sell_price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Example Product"
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               brand_id:
 *                 type: integer
 *                 example: 2
 *               scale:
 *                 type: string
 *                 example: "1:10"
 *               img_url:
 *                 type: string
 *                 example: "http://example.com/image.jpg"
 *               availability:
 *                 type: integer
 *                 example: 100
 *               total:
 *                 type: integer
 *                 example: 150
 *               receival_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-01"
 *               expire_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-12-01"
 *               net_price:
 *                 type: number
 *                 format: float
 *                 example: 20.5
 *               sell_price:
 *                 type: number
 *                 format: float
 *                 example: 30.5
 *               supplier:
 *                 type: string
 *                 example: "Supplier Name"
 *               cost_price:
 *                 type: number
 *                 format: float
 *                 example: 18.0
 *               last_restocked:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-11-15T10:00:00Z"
 *               location:
 *                 type: string
 *                 example: "Warehouse A"
 *               description:
 *                 type: string
 *                 example: "Product description here"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *               shop_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Missing or invalid fields
 *       500:
 *         description: Internal server error
 */
router.post('/', createNewProduct);

/**
 * @swagger
 * /product:
 *   put:
 *     summary: Update an existing product
 *     tags: [Product]
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               brand_id:
 *                 type: integer
 *               scale:
 *                 type: string
 *               img_url:
 *                 type: string
 *               availability:
 *                 type: integer
 *               total:
 *                 type: integer
 *               receival_date:
 *                 type: string
 *                 format: date
 *               expire_date:
 *                 type: string
 *                 format: date
 *               net_price:
 *                 type: number
 *                 format: float
 *               sell_price:
 *                 type: number
 *                 format: float
 *               supplier:
 *                 type: string
 *               cost_price:
 *                 type: number
 *                 format: float
 *               last_restocked:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Missing ID or invalid data
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put('/', updateProduct);

/**
 * @swagger
 * /product/restock:
 *   put:
 *     summary: Restock a product
 *     tags: [Product]
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               scale:
 *                 type: string
 *               availability:
 *                 type: integer
 *               total:
 *                 type: integer
 *               receival_date:
 *                 type: string
 *                 format: date
 *               expire_date:
 *                 type: string
 *                 format: date
 *               net_price:
 *                 type: number
 *                 format: float
 *               sell_price:
 *                 type: number
 *                 format: float
 *               cost_price:
 *                 type: number
 *                 format: float
 *               last_restocked:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Product restocked successfully
 *       400:
 *         description: Missing ID or invalid data
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put('/restock', restockProduct);

/**
 * @swagger
 * /product:
 *   delete:
 *     summary: Delete a product
 *     tags: [Product]
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Missing ID
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete('/', deleteProduct);
router.post("/shop-products",getShopProducts);

export default router;
