import express from 'express';

const router = express.Router();

import { createAdmin, deleteAdmin, getAdmin, getAllAdmins, updateAdmin } from "./../controllers/admincontrollers.js";

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and operations
 */

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuid
 *               - first_name
 *               - last_name
 *               - phone_number
 *               - password
 *               - salary
 *               - permissions
 *               - shop_id
 *             properties:
 *               uuid:
 *                 type: string
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               phone_number:
 *                 type: string
 *                 example: "1234567890"
 *               password:
 *                 type: string
 *                 example: password123
 *               work_start:
 *                 type: string
 *                 example: "09:00"
 *                 description: Optional. Admin work start time in HH:mm format.
 *               work_end:
 *                 type: string
 *                 example: "17:00"
 *                 description: Optional. Admin work end time in HH:mm format.
 *               salary:
 *                 type: number
 *                 example: 50000
 *               shop_id:
 *                 type: string
 *                 example: "001"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["manage_products", "view_orders"]
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Missing fields or invalid data
 *       409:
 *         description: Admin already exists
 *       500:
 *         description: Internal server error
 */

router.post("/", createAdmin);

/**
 * @swagger
 * /admin:
 *   put:
 *     summary: Update an existing admin
 *     tags: [Admin]
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
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               phone_number:
 *                 type: string
 *                 example: "1234567890"
 *               password:
 *                 type: string
 *                 example: newpassword123
 *               work_start:
 *                 type: string
 *                 example: "09:00"
 *               work_end:
 *                 type: string
 *                 example: "17:00"
 *               salary:
 *                 type: number
 *                 example: 55000
 *               shop_id:
 *                 type: string
 *                 example: "001"
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["manage_products", "view_orders"]
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       400:
 *         description: Missing UUID or invalid data
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */
router.put("/", updateAdmin);

/**
 * @swagger
 * /admin:
 *   delete:
 *     summary: Delete an admin
 *     tags: [Admin]
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
 *         description: Admin deleted successfully
 *       400:
 *         description: Missing UUID
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */
router.delete("/", deleteAdmin);
/**
 * @swagger
 * /admin/one:
 *   get:
 *     summary: Get one admin by UUID
 *     tags: [Admin]
 *     parameters:
 *       - in: header
 *         name: uuid
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID of the admin to fetch
 *         example: "some-uuid-string"
 *     responses:
 *       200:
 *         description: Admin fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admin:
 *                   type: object
 *                   description: Admin object
 *       400:
 *         description: Missing UUID
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */

router.get("/one", getAdmin);

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of admins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admins:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
// TODO method change add this to the swagger
router.post("/admins", getAllAdmins);

export default router;
