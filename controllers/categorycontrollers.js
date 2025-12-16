// CREATE TABLE IF NOT EXISTS category (
//   id SERIAL PRIMARY KEY,
//   category_name VARCHAR(255) UNIQUE NOT NULL,
//   products_available INT NOT NULL DEFAULT 0,
//   createdat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
//   updatedat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
// );
import { errorMessages } from "../config/errorMessages.js";
import {client} from "./../config/dbcon.js"
import {v4 as uuidv4} from "uuid"

export const createCategory = async (req, res) => {
  const { category_name } = req.body;

  if (!category_name) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  const uuid = uuidv4();

  try {
    const response = await client.query(
      "INSERT INTO category (category_name, uuid) VALUES ($1, $2) RETURNING *",
      [category_name, uuid]
    );

    return res.status(201).json({
      message: "Category created successfully",
      category: response.rows[0],
    });
  } catch (error) {
    console.error("Error creating category:", error);

    if (error.code === "23505") { // unique_violation
      return res.status(400).json({ error: "Category name already exists" });
    }

    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};


// get all categories
export const getAllCategories = async (req, res) => {

  try {
    const response = await client.query("SELECT * FROM category ORDER BY id DESC");

    if (response.rows.length === 0) {
      return res.status(200).json({ message: "No categories found", data: [] });
    }

    return res.status(200).json({
      message: "Successfully fetched all categories",
      data: response.rows,
    });

  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};




// get one category

export const getCategory = async (req, res) => {
  const { id } = req.body;

  try {
    const response = await client.query(
      "SELECT * FROM category WHERE id = $1",
      [id]
    );

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ data: response.rows[0] });

  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};




// update category
export const updateCategory = async (req, res) => {
  const { id, category_name, products_available } = req.body;

  if (!id) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  // No changes provided
  if (!category_name && products_available === undefined) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (category_name) {
    //   fields.push(`category_name = $${idx++}`);
    //   values.push(category_name);
    }

    if (products_available !== undefined) {
      fields.push(`products_available = $${idx++}`);
      values.push(products_available);
    }

    // always update timestamp
    fields.push(`updatedat = NOW()`);

    const query = `
      UPDATE category
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING *;
    `;

    values.push(id);

    const response = await client.query(query, values);

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      message: "Category updated successfully",
      category: response.rows[0],
    });

  } catch (error) {
    console.error("Error updating category:", error);

    if (error.code === "23505") {
      return res.status(400).json({ error: "Category name already exists" });
    }

    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};


// delete category
export const deleteCategory = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    // Check existence
    const existing = await client.query(
      "SELECT * FROM category WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    const deleted = await client.query(
      "DELETE FROM category WHERE id = $1 RETURNING *",
      [id]
    );

    return res.status(200).json({
      message: "Category deleted successfully",
      deleted_category: deleted.rows[0],
    });

  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};




