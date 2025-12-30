import { client } from '../config/dbcon.js'; 
import { errorMessages } from "./../config/errorMessages.js";
import jwt from "jsonwebtoken"; 
import { JWTKEYS } from '../config/JWT_keys.js';
import { logger } from "../middleware/Logger.js";

// =====================================================
// GENERATE SUPERADMIN TOKEN
// =====================================================
export const generateSuperAdminToken = async (req, res) => {
  if (req.body == null) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  const { uuid, name, phonenumber, password } = req.body;

  if (uuid == null || name == null || phonenumber == null || password == null) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    const isSuperUserFound = await client.query(
      "SELECT * FROM superuser WHERE uuid = $1",
      [uuid]
    );

    if (isSuperUserFound.rows.length === 0) {
      await logger(null, uuid, "Generate SuperAdmin Token FAILED - not found");
      return res.status(404).json({ message: "Super Admin not found" });
    }

    const refreshToken = jwt.sign(
      { uuid, name, phonenumber, role: "superuser" },
      JWTKEYS.jwt_key,
      { expiresIn: "7d" }
    );

    const accessToken = jwt.sign(
      { uuid, name, phonenumber, role: "superuser" },
      JWTKEYS.jwt_key,
      { expiresIn: "1d" }
    );

    await client.query(
      `UPDATE superuser
       SET refreshtoken = $1, accesstoken = $2
       WHERE uuid = $3`,
      [refreshToken, accessToken, uuid]
    );

    await logger(null, uuid, "Generated SuperAdmin Tokens");

    return res.status(200).json({
      message: "Tokens generated",
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error("Token generation error:", error);
    await logger(null, uuid, "Generate SuperAdmin Token ERROR");
    return res.status(500).json({ message: "Server Error" });
  }
};

// =====================================================
// GENERATE ADMIN TOKEN
// =====================================================
export const generateAdminToken = async (req, res) => {
  if (req.body == null) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  const { uuid, name, phonenumber, password } = req.body;

  if (uuid == null || name == null || phonenumber == null || password == null) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    const isAdminFound = await client.query(
      "SELECT * FROM admin WHERE uuid = $1",
      [uuid]
    );

    if (isAdminFound.rows.length === 0) {
      await logger(null, uuid, "Generate Admin Token FAILED - not found");
      return res.status(404).json({ message: "Admin not found" });
    }

    const refreshToken = jwt.sign(
      { uuid, name, phonenumber, role: "admin" },
      JWTKEYS.jwt_key,
      { expiresIn: "7d" }
    );

    const accessToken = jwt.sign(
      { uuid, name, phonenumber, role: "admin" },
      JWTKEYS.jwt_key,
      { expiresIn: "1d" }
    );

    await logger(null, uuid, "Generated Admin Tokens");

    return res.status(200).json({
      message: "Tokens generated",
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error("Token generation error:", error);
    await logger(null, uuid, "Generate Admin Token ERROR");
    return res.status(500).json({ message: "Server Error" });
  }
};

// =====================================================
// LOGIN SUPERUSER
// =====================================================
export const loginSuperUser = async (req, res) => {
  if (req.body == null) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  const {   name,password } = req.body;

  if (name == null || password == null) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    // FIND SUPERUSER
    const result = await client.query(
      "SELECT * FROM superuser WHERE name = $1 and password=$2",
      [name,password]
    );

    const user = result.rows[0];
    console.error(result)

    if (user == null) {
      await logger(null, name, "SuperUser Login FAILED - not found");
      return res.status(404).json({ message: "Superuser not found" });
    }

    // CREATE ACCESS TOKEN
    const accessToken = jwt.sign(
      {
        uuid:user.uuid,
        name,
        shop_id: user.shop_id,
        role: "superuser",
      },
      JWTKEYS.jwt_key,
      { expiresIn: "1d" }
    );

    // UPDATE ACCESSTOKEN IN DATABASE
    await client.query(
      `UPDATE superuser SET accesstoken = $1 WHERE name = $2`,
      [accessToken, name]
    );

    await logger(user.shop_id, name, "Super logged in");

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken: user.refreshtoken,
      user,
    });

  } catch (error) {
    console.error("Login error:", error);
    await logger(null, name, "SuperUser Login ERROR");
    return res.status(500).json({ message: "Server Error" });
  }
};


// =====================================================
// LOGIN ADMIN
// =====================================================
export const loginAdmin = async (req, res) => {
  if (req.body == null) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  const { password, name } = req.body;

  if (password == null || name == null) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    const isAdminFound = await client.query(
      "SELECT * FROM admin WHERE first_name=$1 and password=$2",
      [name,password]
    );

    if (isAdminFound.rows.length === 0) {
      await logger(null, name, "Admin Login FAILED - not found");
      return res.status(404).json({ message: "Admin not found" });
    }

    const accessToken = jwt.sign(
      { uuid:isAdminFound.uuid, name,  role: "admin" },
      JWTKEYS.jwt_key,
      { expiresIn: "1d" }
    );

    await client.query(
      `UPDATE admin
       SET accesstoken=$1
       WHERE first_name=$2`,
      [accessToken, name]
    );

    await logger(null, name, "Admin Logged In");

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken: isAdminFound.rows[0].refreshtoken,
      user: isAdminFound.rows[0]
    });

  } catch (error) {
    console.error("Login error:", error);
    await logger(null, name, "Admin Login ERROR");
    return res.status(500).json({ message: "Server Error" });
  }
};




export const handleLogOut = async (req, res) => {
  const { uuid, role } = req.body;

  if (uuid == null || role == null) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    if (role === "admin") {
      // Check if admin exists
      const admin = await client.query("SELECT * FROM admin WHERE uuid = $1", [uuid]);
      if (admin.rowCount === 0) {
        return res.status(404).json({ message: errorMessages.NOT_FOUND });
      }

      // Clear tokens
      await client.query(
        "UPDATE admin SET accesstoken = NULL, refreshtoken = NULL WHERE uuid = $1",
        [uuid]
      );

      await logger(null, uuid, "Admin logged out");

      return res.status(200).json({ message: "Admin logged out successfully" });
    }

    if (role === "superuser") {
      // Check if superuser exists
      const superuser = await client.query("SELECT * FROM superuser WHERE uuid = $1", [uuid]);
      if (superuser.rowCount === 0) {
        return res.status(404).json({ message: errorMessages.NOT_FOUND });
      }

      // Clear tokens
      await client.query(
        "UPDATE superuser SET accesstoken = NULL, refreshtoken = NULL WHERE uuid = $1",
        [uuid]
      );

      await logger(null, uuid, "Superuser logged out");

      return res.status(200).json({ message: "Superuser logged out successfully" });
    }

    // If role is neither admin nor superuser
    return res.status(400).json({ message: "Invalid role provided" });

  } catch (error) {
    console.error("Logout error:", error);
    await logger(null, uuid, "Logout ERROR");
    return res.status(500).json({ message: "Server Error" });
  }
};
