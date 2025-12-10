import express from "express";
import { client } from '../config/dbcon.js';
import { errorMessages } from "../config/errorMessages.js";
import { v4 as uuid } from "uuid";

// =========================== GET ALL PRODUCTS ===========================
export const getProducts = async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM product");
    res.json(result.rows);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





export const getShopProducts = async (req, res) => {
  const shop_id = req.headers["shop_id"];

  if (!shop_id) {
    return res.status(400).json({ message: "shop_id header is required", data: [] });
  }

  try {
    const products = await client.query("SELECT * FROM product WHERE shop_id = $1", [shop_id]);

    if (products.rowCount === 0) {
      return res.status(404).json({ message: "No products found", data: [] });
    }

    return res.status(200).json({ message: "Successfully found", data: products.rows });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// =========================== GET SINGLE PRODUCT ===========================
export const getSingleProduct = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(200).json({ "message": errorMessages.MISSING_FIELDS });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(401).json({ "message": "id is required for this operation" });
  }

  try {
    const result = await client.query("SELECT * FROM product WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
import { v4 as uuidv4 } from 'uuid'; // if you want to generate uuids for products (optional)

export const createNewProduct = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const {
    name,
    category_id,
    brand_id,
    scale,
    img_url,
    availability,
    total,
    receival_date,
    expire_date,
    net_price,
    sell_price,
    supplier,
    cost_price,
    last_restocked,
    location,
    description,
    is_active,
    shop_id
  } = req.body;

  // Check required fields
  if (
    !name ||
    !category_id ||
    !brand_id ||
    !scale ||
    availability == null ||
    total == null ||
    !net_price ||
    !sell_price
  ) {
    return res.status(400).json({
      message: "Missing required fields"
    });
  }
console.log(req.body)
  try {
    const insertQuery = `
      INSERT INTO product (
        name, category_id, brand_id, scale, img_url, availability, total,
        receival_date, expire_date, net_price, sell_price, supplier,
        cost_price, last_restocked, location, description, is_active, is_expired, shop_id, createdat, updatedat
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, now(), now()
      )
      RETURNING *;
    `;

    const values = [
      name,
      category_id,
      brand_id,
      scale,
      img_url || null,
      availability,
      total,
      receival_date || null,
      expire_date || null,
      net_price,
      sell_price,
      supplier || null,
      cost_price || null,
      last_restocked || null,
      location || null,
      description || null,
      is_active ?? true,
      false,          // is_expired default false
      shop_id || null
    ];

    const response = await client.query(insertQuery, values);

    return res.status(201).json({
      message: "Product created successfully",
      data: response.rows
    });

  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};


// =========================== UPDATE PRODUCT ===========================
export const updateProduct = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "No data provided to update" });
  }

  const {
    name,
    category_id,
    brand_id,
    scale,
    img_url,
    availability,
    total,
    receival_date,
    expire_date,
    net_price,
    sell_price,
    supplier,
    cost_price,
    last_restocked,
    location,
    description,
    is_active
  } = req.body;

  try {
    const updateQuery = `
      UPDATE product
      SET
        name = COALESCE($1, name),
        category_id = COALESCE($2, category_id),
        brand_id = COALESCE($3, brand_id),
        scale = COALESCE($4, scale),
        img_url = COALESCE($5, img_url),
        availability = COALESCE($6, availability),
        total = COALESCE($7, total),
        receival_date = COALESCE($8, receival_date),
        expire_date = COALESCE($9, expire_date),
        net_price = COALESCE($10, net_price),
        sell_price = COALESCE($11, sell_price),
        supplier = COALESCE($12, supplier),
        cost_price = COALESCE($13, cost_price),
        last_restocked = COALESCE($14, last_restocked),
        location = COALESCE($15, location),
        description = COALESCE($16, description),
        is_active = COALESCE($17, is_active),
        updatedat = now()
      WHERE id = $18
      RETURNING *;
    `;

    const values = [
      name || null,
      category_id || null,
      brand_id || null,
      scale || null,
      img_url || null,
      availability || null,
      total || null,
      receival_date || null,
      expire_date || null,
      net_price || null,
      sell_price || null,
      supplier || null,
      cost_price || null,
      last_restocked || null,
      location || null,
      description || null,
      is_active,
      id
    ];

    const response = await client.query(updateQuery, values);

    if (response.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      data: response.rows[0]
    });

  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};
// =========================== RESTOCK PRODUCT ===========================
export const restockProduct = async (req, res) => {
  const { id, total, availability } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }
 const stock=availability+total;
  try {
    const updateQuery = `
      UPDATE product
      SET
        total = $2,
        availability = $3,
        updatedat = now()
      WHERE id = $1
      RETURNING *;
    `;

    const values = [id, total, stock];

    const response = await client.query(updateQuery, values);

    if (response.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product restocked successfully",
      data: response.rows,
    });

  } catch (error) {
    console.error("Error restocking product:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// =========================== DELETE PRODUCT ===========================
export const deleteProduct = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const query = `
      DELETE FROM product
      WHERE id = $1
      RETURNING *;
    `;

    const response = await client.query(query, [id]);

    if (response.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      data: response.rows
    });

  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};
