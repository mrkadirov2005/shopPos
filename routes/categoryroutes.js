import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from "../controllers/categorycontrollers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Category management and operations
 */

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully fetched all categories
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
router.post("/", getAllCategories);

/**
 * @swagger
 * /category/one:
 *   get:
 *     summary: Get a single category by id
 *     tags: [Category]
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the category to fetch
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing id
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get("/one", getCategory);

/**
 * @swagger
 * /category/create:
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *             properties:
 *               category_name:
 *                 type: string
 *                 example: Electronics
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Missing fields or invalid data
 *       500:
 *         description: Internal server error
 */
router.post("/create", createCategory);
// TODO catergory and brand updated the create so update the swagger as well

/**
 * @swagger
 * /category:
 *   put:
 *     summary: Update an existing category
 *     tags: [Category]
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
 *               category_name:
 *                 type: string
 *                 example: Electronics
 *               products_available:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Missing fields or invalid data
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.put("/", updateCategory);

/**
 * @swagger
 * /category:
 *   delete:
 *     summary: Delete a category
 *     tags: [Category]
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
 *         description: Category deleted successfully
 *       400:
 *         description: Missing id
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.delete("/", deleteCategory);

export default router;
