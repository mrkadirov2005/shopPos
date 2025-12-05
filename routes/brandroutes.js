import express from "express";
import {
  createBrand,
  deleteBrand,
  getAllBrands,
  getSingleBrand,
  updateBrand,
} from "./../controllers/brandcontrollers.js";
import { validateToken } from "../middleware/validateToken.js"; // Adjust path if needed

const router = express.Router();

// Protect all brand routes with validateToken middleware
router.use(validateToken);

/**
 * @swagger
 * tags:
 *   name: Brand
 *   description: Brand management and operations
 */

/**
 * @swagger
 * /brand:
 *   get:
 *     summary: Get all brands
 *     tags: [Brand]
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: List of brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fetched all data
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
router.post("/", getAllBrands);

/**
 * @swagger
 * /brand/one:
 *   get:
 *     summary: Get a single brand by UUID
 *     tags: [Brand]
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: query
 *         name: uuid
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the brand to fetch
 *     responses:
 *       200:
 *         description: Brand fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fetched all data
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing UUID
 *       404:
 *         description: Brand not found
 *       500:
 *         description: Internal server error
 */
router.get("/one", getSingleBrand);

/**
 * @swagger
 * /brand/create:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brand]
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brand_name
 *               - provider_name
 *               - provider_last_name
 *               - provider_phone
 *               - provider_email
 *             properties:
 *               brand_name:
 *                 type: string
 *                 example: Apple
 *               provider_name:
 *                 type: string
 *                 example: John
 *               provider_last_name:
 *                 type: string
 *                 example: Doe
 *               provider_phone:
 *                 type: string
 *                 example: "1234567890"
 *               provider_card_number:
 *                 type: string
 *                 example: "1111 2222 3333 4444"
 *               provider_email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *     responses:
 *       201:
 *         description: Brand created successfully
 *       400:
 *         description: Missing fields or invalid data
 *       500:
 *         description: Internal server error
 */
router.post("/create", createBrand);

/**
 * @swagger
 * /brand:
 *   put:
 *     summary: Update an existing brand
 *     tags: [Brand]
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuid
 *             properties:
 *               uuid:
 *                 type: string
 *                 example: "some-uuid-string"
 *               brand_name:
 *                 type: string
 *                 example: Apple
 *               provider_name:
 *                 type: string
 *                 example: John
 *               provider_last_name:
 *                 type: string
 *                 example: Doe
 *               provider_phone:
 *                 type: string
 *                 example: "1234567890"
 *               provider_card_number:
 *                 type: string
 *                 example: "1111 2222 3333 4444"
 *               provider_email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       400:
 *         description: Missing UUID or invalid data
 *       404:
 *         description: Brand not found
 *       500:
 *         description: Internal server error
 */
router.put("/", updateBrand);

/**
 * @swagger
 * /brand:
 *   delete:
 *     summary: Delete a brand
 *     tags: [Brand]
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuid
 *             properties:
 *               uuid:
 *                 type: string
 *                 example: "some-uuid-string"
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       400:
 *         description: Missing UUID
 *       404:
 *         description: Brand not found
 *       500:
 *         description: Internal server error
 */
router.delete("/", deleteBrand);

export default router;
