import express from "express";
const router = express.Router();

import { 
    getShopBranches, 
    getShops,
    createBranch,
    updateBranch,
    deleteBranch,
    getBranchById
} from "../controllers/shopcontrollers.js";

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
 *       - secretKeyAuth: []
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

/**
 * @swagger
 * /shops/branches:
 *   get:
 *     summary: Get all branches for a shop
 *     tags:
 *       - Shops
 *     parameters:
 *       - in: header
 *         name: shop_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of branches
 *       400:
 *         description: Missing shop_id
 *       404:
 *         description: No branches found
 *       500:
 *         description: Server error
 */
router.get("/branches", getShopBranches);

/**
 * @swagger
 * /shops/get-branch:
 *   post:
 *     summary: Get a branch by ID
 *     tags:
 *       - Shops
 *     parameters:
 *       - in: header
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Branch data
 *       400:
 *         description: Missing ID
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
// TODO it is working on shop/getbranch with the post request and id in body
router.post("/getbranch", getBranchById);

/**
 * @swagger
 * /shop/branch:
 *   post:
 *     summary: Create new branch
 *     tags:
 *       - Shops
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               employees:
 *                 type: integer
 *               shop_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Branch created
 *       400:
 *         description: Missing fields
 *       500:
 *         description: Server error
 */
router.post("/branch", createBranch);

/**
 * @swagger
 * /shops/branch:
 *   put:
 *     summary: Update branch details
 *     tags:
 *       - Shops
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               employees:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Branch updated
 *       400:
 *         description: Missing ID
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.put("/branch", updateBranch);

/**
 * @swagger
 * /shops/branch:
 *   delete:
 *     summary: Delete branch by ID
 *     tags:
 *       - Shops
 *     parameters:
 *       - in: header
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Branch deleted
 *       400:
 *         description: Missing ID
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
router.delete("/branch", deleteBranch);

export default router;
