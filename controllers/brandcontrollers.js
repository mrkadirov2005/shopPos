// CREATE TABLE IF NOT EXISTS brand (
//   id SERIAL PRIMARY KEY,
//   brand_name VARCHAR(255) UNIQUE NOT NULL,
//   provider_name VARCHAR(255) NOT NULL,
//   provider_last_name VARCHAR(255) NOT NULL,
//   provider_phone VARCHAR(255) NOT NULL,
//   provider_card_number VARCHAR(255) NOT NULL,
//   provider_email VARCHAR(255),
//   product_counts INT NOT NULL DEFAULT 0,
//   createdat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
//   updatedat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
// );
import express from "express";
import {client} from '../config/dbcon.js';
import { errorMessages } from "../config/errorMessages.js";
import {v4 as uuidv4} from "uuid";
import { logger } from "../middleware/Logger.js";
import { extractJWT } from "../middleware/extractToken.js";

export const createBrand = async (req, res) => {
  let {
    brand_name,
    provider_name,
    provider_last_name,
    provider_phone,
    provider_card_number,
    provider_email
  } = req.body;

  const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
  const shop_id = req.headers["shop_id"] || null;

  // Required fields validation
  if (
    brand_name == null ||
    provider_name == null ||
    provider_last_name == null ||
    provider_phone == null ||
    provider_email == null
  ) {
    await logger(shop_id, user_id, "Create brand failed - missing required fields");
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  // Default card number
  if (provider_card_number == null) {
    provider_card_number = "0000 0000 0000 0000";
  }

  const uuid = uuidv4();

  try {
    const response = await client.query(
      `INSERT INTO brand 
       (brand_name, provider_name, provider_last_name, provider_phone, provider_card_number, provider_email, uuid) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        brand_name,
        provider_name,
        provider_last_name,
        provider_phone,
        provider_card_number,
        provider_email,
        uuid
      ]
    );

    await logger(shop_id, user_id, `Brand created successfully: ${brand_name}`);

    return res.status(201).json({
      message: "Brand created successfully",
      brand: response.rows[0],
    });

  } catch (error) {
    console.error("Error creating brand:", error);

    if (error.code === "23505") {
      await logger(shop_id, user_id, `Create brand failed - brand name already exists: ${brand_name}`);
      return res.status(400).json({ error: "Brand name already exists" });
    }

    await logger(shop_id, user_id, `Create brand failed - error: ${error.message}`);
    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};

export const getAllBrands=async(req,res)=>{
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    try {
        const response=await client.query("SELECT * FROM  brand");
        if(response.rows.length>0){
            await logger(shop_id, user_id, `Fetched all brands - count: ${response.rows.length}`);
            return res.status(200).json({"message":"Fetched all data","data":response.rows})
        }
        await logger(shop_id, user_id, "Fetched all brands - no brands found");
        return res.status(200).json({"message":"No brands found","data":[]});
    } catch (error) {
        await logger(shop_id, user_id, `Get all brands failed - error: ${error.message}`);
        return res.status(500).json({"message":errorMessages.INTERNAL_SERVER_ERROR,"error":error})
    }
}

export const getSingleBrand=async(req,res)=>{
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    if(req.body == null){
        await logger(shop_id, user_id, "Get single brand failed - missing request body");
        return res.status(400).json({"messages":errorMessages.MISSING_FIELDS})
    }
    const {uuid}=req.body;
    if(uuid == null){
        await logger(shop_id, user_id, "Get single brand failed - missing uuid");
        return res.status(400).json({"messages":errorMessages.MISSING_FIELDS})
    }
     try {
        const response=await client.query("SELECT * FROM  brand WHERE uuid=$1",[uuid]);
        if(response.rows.length>0){
            await logger(shop_id, user_id, `Fetched single brand: ${response.rows[0].brand_name}`);
            return res.status(200).json({"message":"Fetched all data","data":response.rows[0]})
        }
        else{
            await logger(shop_id, user_id, `Get single brand failed - brand not found: ${uuid}`);
            return res.status(404).json({"message":"Brand not found"})
        }
    } catch (error) {
        await logger(shop_id, user_id, `Get single brand failed - error: ${error.message}`);
        return res.status(500).json({"message":errorMessages.INTERNAL_SERVER_ERROR,"error":error})
    }
}

export const updateBrand = async (req, res) => {
  console.log(req.body)
  const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
  const shop_id = req.headers["shop_id"] || null;

  try {
    const { uuid } = req.body;

    if (uuid == null) {
      await logger(shop_id, user_id, "Update brand failed - UUID is required");
      return res.status(400).json({ message: "UUID is required" });
    }

    // 1. Get existing brand from DB
    const existing = await client.query(
      "SELECT * FROM brand WHERE uuid = $1",
      [uuid]
    );

    if (existing.rows.length === 0) {
      await logger(shop_id, user_id, `Update brand failed - brand not found: ${uuid}`);
      return res.status(404).json({ message: "Brand not found" });
    }

    const oldData = existing.rows[0];

    // Fields allowed to update
    const allowedFields = [
      "brand_name",
      "provider_name",
      "provider_last_name",
      "provider_phone",
      "provider_card_number",
      "provider_email",
    ];

    const fields = [];
    const values = [];
    let index = 1;

    // 2. Detect changed fields dynamically
    for (const key of allowedFields) {
      if (req.body[key] !== undefined && req.body[key] !== oldData[key]) {
        fields.push(`${key} = $${index}`);
        values.push(req.body[key]);
        index++;
      }
    }

    // 3. If no fields changed
    if (fields.length === 0) {
      return res.status(200).json({
        message: "Nothing changed",
        brand: oldData,
      });
    }
    // Always update timestamp
    fields.push(`updatedAt = NOW()`);
    const query = `
      UPDATE brand
      SET ${fields.join(", ")}
      WHERE uuid = $${index}
      RETURNING *;
    `;

    values.push(uuid);

    const updated = await client.query(query, values);

    await logger(shop_id, user_id, `Brand updated successfully: ${updated.rows[0].brand_name}`);

    return res.status(200).json({
      message: "Brand updated successfully",
      brand: updated.rows[0],
    });

  } catch (error) {
    console.error("Error updating brand:", error);

    if (error.code === "23505") {
      await logger(shop_id, user_id, "Update brand failed - brand name already exists");
      return res.status(400).json({ error: "Brand name already exists" });
    }

    await logger(shop_id, user_id, `Update brand failed - error: ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteBrand = async (req, res) => {
  const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
  const shop_id = req.headers["shop_id"] || null;

  try {
    if (req.body == null || req.body.uuid == null) {
      await logger(shop_id, user_id, "Delete brand failed - missing uuid");
      return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
    }

    const { uuid } = req.body;

    // 1. Check if brand exists
    const existing = await client.query(
      "SELECT * FROM brand WHERE uuid = $1",
      [uuid]
    );

    if (existing.rows.length === 0) {
      await logger(shop_id, user_id, `Delete brand failed - brand not found: ${uuid}`);
      return res.status(404).json({ message: "Brand not found" });
    }

    // 2. Delete the brand
    const deleted = await client.query(
      "DELETE FROM brand WHERE uuid = $1 RETURNING *",
      [uuid]
    );

    await logger(shop_id, user_id, `Brand deleted successfully: ${deleted.rows[0].brand_name}`);

    return res.status(200).json({
      message: "Brand deleted successfully",
      deleted_brand: deleted.rows[0],
    });

  } catch (error) {
    console.error("Error deleting brand:", error);

    await logger(shop_id, user_id, `Delete brand failed - error: ${error.message}`);

    return res.status(500).json({
      error: errorMessages.INTERNAL_SERVER_ERROR,
    });
  }
};
