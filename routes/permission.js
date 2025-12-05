import express from "express";
import { createPermission,getAllPermissions } from "../controllers/permissionscontroller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Permission
 *   description: Permission management and operations
 */

/**
 * @swagger
 * /permission:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permission]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: manage_products
 *     responses:
 *       201:
 *         description: Permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permission created successfully
 *                 permission:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: manage_products
 *       400:
 *         description: Missing fields or invalid data
 *       409:
 *         description: Permission already exists
 *       500:
 *         description: Internal server error
 */
router.post("/", createPermission);
router.post("/permissions",getAllPermissions)
export default router;
