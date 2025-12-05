import express from "express";
import {
  getsuperadmins,
  createsuperadmin,
  updateSuperUser,
  deleteSuperUser
} from "../controllers/superadmincontrollers.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Superadmin
 *     description: APIs for managing superadmins
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Superadmin:
 *       type: object
 *       properties:
 *         uuid:
 *           type: string
 *         name:
 *           type: string
 *         lastname:
 *           type: string
 *         email:
 *           type: string
 *         phonenumber:
 *           type: string
 *         isloggedin:
 *           type: boolean
 *         password:
 *           type: string
 *         shopname:
 *           type: string
 *         img_url:
 *           type: string
 *   securitySchemes:
 *     SuperadminSecret:
 *       type: apiKey
 *       in: header
 *       name: secret_word
 */

/**
 * @swagger
 * /superadmin:
 *   get:
 *     summary: Get all superadmins
 *     tags: [Superadmin]
 *     responses:
 *       200:
 *         description: List of superadmins
 */
router.get("/", getsuperadmins);

/**
 * @swagger
 * /superadmin:
 *   post:
 *     summary: Create a new superadmin
 *     tags: [Superadmin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lastname
 *               - email
 *               - phonenumber
 *               - password
 *               - shopname
 *     responses:
 *       201:
 *         description: Superadmin created successfully
 *       400:
 *         description: Missing fields
 */
router.post("/", createsuperadmin);

/**
 * @swagger
 * /superadmin:
 *   put:
 *     summary: Update a superadmin
 *     tags: [Superadmin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuid
 *               - name
 *               - lastname
 *               - email
 *               - phonenumber
 *               - password
 *               - shopname
 *               - img_url
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Not found
 */
router.put("/", updateSuperUser);

/**
 * @swagger
 * /superadmin:
 *   delete:
 *     summary: Delete a superadmin
 *     tags: [Superadmin]
 *     security:
 *       - SuperadminSecret: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuid
 *               - secret_word
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       403:
 *         description: Invalid secret word
 */
router.delete("/", deleteSuperUser);

export default router;
