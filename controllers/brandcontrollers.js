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
import {v4 as uuidv4} from "uuid"

export const createBrand = async (req, res) => {
  let {
    brand_name,
    provider_name,
    provider_last_name,
    provider_phone,
    provider_card_number,
    provider_email
  } = req.body;

  // Required fields validation
  if (
    !brand_name ||
    !provider_name ||
    !provider_last_name ||
    !provider_phone ||
    !provider_email
  ) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  // Default card number
  if (!provider_card_number) {
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

    return res.status(201).json({
      message: "Brand created successfully",
      brand: response.rows[0],
    });

  } catch (error) {
    console.error("Error creating brand:", error);

    if (error.code === "23505") {
      return res.status(400).json({ error: "Brand name already exists" });
    }

    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};

export const getAllBrands=async(req,res)=>{
    try {
        const response=await client.query("SELECT * FROM  brand");
        if(response.rows.length>0){
            return res.status(200).json({"message":"Fetched all data","data":response.rows})
        }
    } catch (error) {
        return res.status(500).json({"message":errorMessages.INTERNAL_SERVER_ERROR,"error":error})
    }
}

export const getSingleBrand=async(req,res)=>{
    if(!req.body){
        return res.status(400).json({"messages":errorMessages.MISSING_FIELDS})
    }
    const {uuid}=req.body;
    if(!uuid){
        return res.status(400).json({"messages":errorMessages.MISSING_FIELDS})
    }
     try {
        const response=await client.query("SELECT * FROM  brand WHERE uuid=$1",[uuid]);
        if(response.rows.length>0){
            return res.status(200).json({"message":"Fetched all data","data":response.rows[0]})
        }
        else{
            return res.status(404).json({"message":"Brand not found"})
        }
    } catch (error) {
        return res.status(500).json({"message":errorMessages.INTERNAL_SERVER_ERROR,"error":error})
    }
}

export const updateBrand = async (req, res) => {
  try {
    const { uuid } = req.body;

    if (!uuid) {
      return res.status(400).json({ message: "UUID is required" });
    }

    // 1. Get existing brand from DB
    const existing = await client.query(
      "SELECT * FROM brand WHERE uuid = $1",
      [uuid]
    );

    if (existing.rows.length === 0) {
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

    return res.status(200).json({
      message: "Brand updated successfully",
      brand: updated.rows[0],
    });

  } catch (error) {
    console.error("Error updating brand:", error);

    if (error.code === "23505") {
      return res.status(400).json({ error: "Brand name already exists" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    if (!req.body || !req.body.uuid) {
      return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
    }

    const { uuid } = req.body;

    // 1. Check if brand exists
    const existing = await client.query(
      "SELECT * FROM brand WHERE uuid = $1",
      [uuid]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // 2. Delete the brand
    const deleted = await client.query(
      "DELETE FROM brand WHERE uuid = $1 RETURNING *",
      [uuid]
    );

    return res.status(200).json({
      message: "Brand deleted successfully",
      deleted_brand: deleted.rows[0],
    });

  } catch (error) {
    console.error("Error deleting brand:", error);

    return res.status(500).json({
      error: errorMessages.INTERNAL_SERVER_ERROR,
    });
  }
};
