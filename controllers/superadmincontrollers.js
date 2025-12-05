import { client } from '../config/dbcon.js';
import { errorMessages } from '../config/errorMessages.js';
import { v4 as uuidv4 } from 'uuid';
import { secret_keys } from '../config/keys.js';

export const getsuperadmins = async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM superuser");
    res.json(result.rows);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createsuperadmin = async (req, res) => {
  const { name, lastname, email, phonenumber, isLoggedin = false, password, shopname } = req.body;
  const img_url = "https://picsum.photos/200";

  if (!name || !lastname || !email || !phonenumber || !password || !shopname) {
    return res.status(400).json({ error: errorMessages.MISSING_FIELDS });
  }

  const uuid = uuidv4();

  try {
    const response = await client.query(
      `INSERT INTO superuser (uuid, name, lastname, email, phonenumber, isloggedin, password, shopname, img_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [uuid, name, lastname, email, phonenumber, isLoggedin, password, shopname, img_url]
    );

    return res.status(201).json({
      message: "Superadmin created successfully",
      superadmin: response.rows[0]
    });

  } catch (error) {
    console.error("Error creating superadmin:", error);
    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};

export const updateSuperUser = async (req, res) => {
  const { uuid, name, lastname, email, phonenumber, isLoggedin = false, password, shopname, img_url } = req.body;

  if (!uuid) {
    return res.status(400).json({ error: "Missing UUID in request body" });
  }

  if (!name || !lastname || !email || !phonenumber || !password || !shopname || !img_url) {
    return res.status(400).json({ error: errorMessages.MISSING_FIELDS });
  }

  try {
    const response = await client.query(
      `UPDATE superuser 
       SET name=$1, lastname=$2, email=$3, phonenumber=$4, isloggedin=$5,
           password=$6, shopname=$7, img_url=$8, updatedat=now()
       WHERE uuid=$9
       RETURNING *`,
      [name, lastname, email, phonenumber, isLoggedin, password, shopname, img_url, uuid]
    );

    if (!response.rows.length) {
      return res.status(404).json({ error: "Superadmin not found" });
    }

    return res.status(200).json({
      message: "Superadmin updated successfully",
      superadmin: response.rows[0]
    });

  } catch (error) {
    console.error("Error updating superadmin:", error);
    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};

export const deleteSuperUser = async (req, res) => {
  const { uuid, secret_word } = req.body;

  if (!uuid || !secret_word) {
    return res.status(400).json({ error: errorMessages.MISSING_FIELDS });
  }

  if (secret_word !== secret_keys.superuser) {
    return res.status(403).json({ error: errorMessages.INVALID_CREDENTIALS });
  }

  try {
    const response = await client.query(
      `DELETE FROM superuser WHERE uuid=$1 RETURNING *`,
      [uuid]
    );

    if (!response.rows.length) {
      return res.status(404).json({ error: "Superadmin not found" });
    }

    return res.status(200).json({
      message: "Superadmin deleted successfully",
      superadmin: response.rows[0]
    });

  } catch (error) {
    console.error("Error deleting superadmin:", error);
    return res.status(500).json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }
};
