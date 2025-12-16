import express from "express";
const router = express.Router();

import { generateSuperAdminToken, generateAdminToken, loginSuperUser, loginAdmin, handleLogOut } from "./../controllers/authcontroller.js";

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication related endpoints for Superuser and Admin
 */

/**
 * @swagger
 * /auth/generate/superuser:
 *   post:
 *     summary: Generate tokens for Superuser
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuid
 *               - name
 *               - phonenumber
 *               - password
 *             properties:
 *               uuid:
 *                 type: string
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               name:
 *                 type: string
 *                 example: "John Superuser"
 *               phonenumber:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Tokens generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tokens generated"
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Super Admin not found
 *       500:
 *         description: Server error
 */
router.post("/generate/superuser", generateSuperAdminToken);

/**
 * @swagger
 * /auth/generate/admin:
 *   post:
 *     summary: Generate tokens for Admin
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuid
 *               - name
 *               - phonenumber
 *               - password
 *             properties:
 *               uuid:
 *                 type: string
 *                 example: "admin-uuid-1234"
 *               name:
 *                 type: string
 *                 example: "Jane Admin"
 *               phonenumber:
 *                 type: string
 *                 example: "+0987654321"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Tokens generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tokens generated"
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.post("/generate/admin", generateAdminToken);

/**
 * @swagger
 * /auth/login/superuser:
 *   post:
 *     summary: Login as Superuser
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuid
 *               - phonenumber
 *               - name
 *             properties:
 *               uuid:
 *                 type: string
 *                 example: "superuser-uuid-1234"
 *               phonenumber:
 *                 type: string
 *                 example: "+1234567890"
 *               name:
 *                 type: string
 *                 example: "John Superuser"
 *     responses:
 *       200:
 *         description: Login successful with tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Superuser not found
 *       500:
 *         description: Server error
 */
router.post("/login/superuser", loginSuperUser);

/**
 * @swagger
 * /auth/login/admin:
 *   post:
 *     summary: Login as Admin
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuid
 *               - phonenumber
 *               - name
 *             properties:
 *               uuid:
 *                 type: string
 *                 example: "admin-uuid-1234"
 *               phonenumber:
 *                 type: string
 *                 example: "+0987654321"
 *               name:
 *                 type: string
 *                 example: "Jane Admin"
 *     responses:
 *       200:
 *         description: Login successful with tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.post("/login/admin", loginAdmin);

router.post("/logout",handleLogOut)

export default router;
