import express from 'express'; 
import pkg from 'pg'; 
import { client } from '../config/dbcon.js'; 
import { errorMessages } from '../config/errorMessages.js';
import { v4 as uuidv4 } from 'uuid';

import jwt from "jsonwebtoken";
import { JWTKEYS } from '../config/JWT_keys.js';
import { logger } from '../middleware/Logger.js';
import { extractJWT } from '../middleware/extractToken.js';


// =============================================
// CREATE ADMIN
// =============================================
export const createAdmin = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: errorMessages.MISSING_FIELDS });
  }

  let {
    uuid,
    first_name,
    last_name,
    phone_number,
    password,
    work_start,
    work_end,
    salary,
    permissions,
    shop_id,
    branch
  } = req.body;

  if (!uuid || !first_name || !last_name || !phone_number || !password || !salary || !permissions || !shop_id || !branch) {
    return res.status(400).json({ error: errorMessages.MISSING_FIELDS });
  }

  const salaryNum = Number(salary);
  if (isNaN(salaryNum)) {
    return res.status(400).json({ error: "Invalid salary value" });
  }

  if (!Array.isArray(permissions)) {
    permissions = [permissions];
  }

  work_start = work_start || null;
  work_end = work_end || null;

  const img_url = "https://picsum.photos/200";

  try {
    const existingAdmin = await client.query(
      `SELECT * FROM admin WHERE uuid = $1 OR phone_number = $2`,
      [uuid, phone_number]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(409).json({ error: errorMessages.EXISTING_ADMIN });
    }

    const accessToken = jwt.sign(
      { phone_number, role: "admin" },
      JWTKEYS.admin,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { phone_number, role: "admin" },
      JWTKEYS.admin,
      { expiresIn: "30d" }
    );

    const response = await client.query(
      `INSERT INTO admin (
        uuid,
        first_name,
        last_name,
        phone_number,
        password,
        work_start,
        work_end,
        salary,
        permissions,
        img_url,
        accesstoken,
        refreshtoken,
        shop_id,
        branch
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        uuid,
        first_name,
        last_name,
        phone_number,
        password,
        work_start,
        work_end,
        salaryNum,
        permissions,
        img_url,
        accessToken,
        refreshToken,
        shop_id,
        branch
      ]
    );

    // LOGGER HERE ----------------------------------------------------
    const userId = extractJWT(req.headers["authorization"]);
    await logger(shop_id, userId, "Admin created", {
      uuid,
      first_name,
      last_name,
      phone_number
    });

    return res.status(201).json({
      message: "Admin created successfully",
      data: response.rows,
    });

  } catch (error) {
    console.error("Error creating admin:", error);

    const userId = extractJWT(req.headers["authorization"]);
    await logger(shop_id, userId, "Admin creation failed", { error: error.message });

    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};


// =============================================
// UPDATE ADMIN
// =============================================
export const updateAdmin = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: errorMessages.MISSING_FIELDS });
  }

  const { uuid, first_name, last_name, phone_number, password, work_start, work_end, salary, permissions } = req.body;

  if (!uuid) {
    return res.status(400).json({ error: errorMessages.MISSING_FIELDS });
  }

  try {
    const response = await client.query(
      `UPDATE admin SET 
        first_name = $1, 
        last_name = $2, 
        phone_number = $3, 
        password = $4,
        work_start = $5,  
        work_end = $6,  
        salary = $7,
        permissions = $8,
        updatedat = now()
      WHERE uuid = $9
      RETURNING *`,
      [
        first_name,
        last_name,
        phone_number,
        password,
        work_start,
        work_end,
        salary,
        permissions,
        uuid
      ]
    );

    if (response.rows.length > 0) {
      const userId = extractJWT(req.headers["authorization"]);
      await logger(response.rows[0].shop_id, userId, "Admin updated", { uuid });

      return res.status(200).json({
        message: "Admin updated successfully",
        data: response.rows
      });

    } else {
      return res.status(404).json({ error: "Admin not found" });
    }

  } catch (error) {
    console.error("Error updating admin:", error);

    const userId = extractJWT(req.headers["authorization"]);
    await logger(null, userId, "Admin update failed", { error: error.message });

    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }

};


// =============================================
// DELETE ADMIN
// =============================================
export const deleteAdmin = async (req, res) => {
  const { uuid } = req.body;

  if (!uuid) {
    return res.status(400).json({ error: errorMessages.MISSING_FIELDS });
  }

  try {
    const response = await client.query(
      `DELETE FROM admin WHERE uuid=$1 RETURNING *`,
      [uuid]
    );

    if (response.rows.length > 0) {
      const userId = extractJWT(req.headers["authorization"]);
      await logger(response.rows[0].shop_id, userId, "Admin deleted", { uuid });

      return res.status(200).json({ message: "Admin deleted successfully", data: response.rows });

    } else {
      return res.status(404).json({ error: "Admin not found" });
    }

  } catch (error) {
    console.error("Error deleting admin:", error);

    const userId = extractJWT(req.headers["authorization"]);
    await logger(null, userId, "Admin deletion failed", { error: error.message });

    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};


// =============================================
// GET SINGLE ADMIN
// =============================================
export const getAdmin = async (req, res) => {
  const uuid = req.headers["uuid"];

  if (!uuid) {
    return res.status(400).json({ error: errorMessages.MISSING_FIELDS });
  }

  try {
    const response = await client.query(
      `SELECT * FROM admin WHERE uuid=$1`,
      [uuid]
    );

    if (response.rows.length > 0) {
      const userId = extractJWT(req.headers["authorization"]);
      await logger(response.rows[0].shop_id, userId, "Admin fetched", { uuid });

      return res.status(200).json({ admin: response.rows[0] });

    } else {
      return res.status(404).json({ error: "Admin not found" });
    }

  } catch (error) {
    console.error("Error fetching admin:", error);

    const userId = extractJWT(req.headers["authorization"]);
    await logger(null, userId, "Admin fetch failed", { error: error.message });

    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};


// =============================================
// GET ALL ADMINS
// =============================================
export const getAllAdmins = async (req, res) => {
  const shop_id = req.headers["shop_id"];

  try {
    const response = await client.query(
      `SELECT * FROM admin WHERE shop_id=$1`,
      [shop_id]
    );

    const userId = extractJWT(req.headers["authorization"]);
    await logger(shop_id, userId, "All admins fetched");

    return res.status(200).json({ message: "successfully fetched", data: response.rows });

  } catch (error) {
    console.error("Error fetching admins:", error);

    const userId = extractJWT(req.headers["authorization"]);
    await logger(shop_id, userId, "Fetch all admins failed", { error: error.message });

    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};
