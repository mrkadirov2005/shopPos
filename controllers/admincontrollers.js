import express from 'express';
import pkg from 'pg';
import { client } from '../config/dbcon.js';
import { errorMessages } from '../config/errorMessages.js';
import { v4 as uuidv4 } from 'uuid';


import jwt from "jsonwebtoken";
import { JWTKEYS } from '../config/JWT_keys.js';
import { logger } from '../middleware/Logger.js';
import { extractJWT } from '../middleware/extractToken.js';
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
    shop_id
  } = req.body;

  // Validate required fields
  if (!uuid || !first_name || !last_name || !phone_number || !password || !salary || !permissions || !shop_id) {
    return res.status(400).json({ error: errorMessages.MISSING_FIELDS });
  }

  // Convert salary to number
  const salaryNum = Number(salary);
  if (isNaN(salaryNum)) {
    return res.status(400).json({ error: "Invalid salary value" });
  }

  // Ensure permissions is an array
  if (!Array.isArray(permissions)) {
    permissions = [permissions];
  }

  // work_start and work_end are optional strings, allow null if missing
  work_start = work_start || null;
  work_end = work_end || null;

  const img_url = "https://picsum.photos/200";

  try {
    // Check if admin exists
    const existingAdmin = await client.query(
      `SELECT * FROM admin WHERE uuid = $1 OR phone_number = $2`,
      [uuid, phone_number]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(409).json({ error: errorMessages.EXISTING_ADMIN });
    }

    // Generate tokens
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

    // Insert into DB (no id field, let DB handle it)
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
        shop_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
        shop_id
      ]
    );
    const id=extractJWT(req.headers["authorization"])
      await logger(shop_id,id,"User Created by superuser")
    return res.status(201).json({
      message: "Admin created successfully",
      data: response.rows,
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// create sample json for testing
/*
{
    "first_name":"John",
    "last_name":"Doe",
    "phone_number":"1234567890",
    "password":"password123",
    "work_start":"09:00",
    "work_end":"17:00",
    "salary":50000,
    "permissions":["manage_products","view_orders"]
}
*/
export const updateAdmin = async (req, res) => {
  // update admin details
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
      return res

        .status(200)
        .json({ message: "Admin updated successfully", data: response.rows });
    } else {
      return res
        .status(404)
        .json({ error: "Admin not found" });
    }
  } catch (error) {
    console.error("Error updating admin:", error);
    return res
      .status(500)
      .json({ error: errorMessages.INTERNAL_SERVER_ERROR });
  }

}


export const deleteAdmin=async(req,res)=>{
  const {uuid}=req.body;
  if(!uuid){
    return res.status(400).json({error:errorMessages.MISSING_FIELDS});
  }
  try{
    const response=await client.query(
      `DELETE FROM admin WHERE uuid=$1 RETURNING *`,
      [uuid]
    );
    if(response.rows.length>0){
      return res.status(200).json({message:"Admin deleted successfully",data:response.rows});
    }else{
      return res.status(404).json({error:"Admin not found"});
    }
  }catch(error){
    console.error("Error deleting admin:",error);
    return res.status(500).json({error:errorMessages.INTERNAL_SERVER_ERROR});
  }
}



export const getAdmin=async(req,res)=>{
  console.log(req.headers)
  const uuid=req.headers["uuid"];

  if(!uuid){
    return res.status(400).json({error:errorMessages.MISSING_FIELDS});
  }
  try{
    const response=await client.query(
      `SELECT * FROM admin WHERE uuid=$1`,
      [uuid]
    );
    if(response.rows.length>0){
      return res.status(200).json({admin:response.rows[0]});
    }else{
      return res.status(404).json({error:"Admin not found"});
    }
  }catch(error){
    console.error("Error fetching admin:",error);
    return res.status(500).json({error:errorMessages.INTERNAL_SERVER_ERROR});
  }
}

export const getAllAdmins=async(req,res)=>{
  const shop_id=req.headers["shop_id"]
  // TODO add this shop id to the swagger
  try{
    const response=await client.query(
      `SELECT * FROM admin WHERE shop_id=$1`,[shop_id]
    );
    return res.status(200).json({message:"successfully fetched",data:response.rows});
  }catch(error){
    console.error("Error fetching admins:",error);
    return res.status(500).json({error:errorMessages.INTERNAL_SERVER_ERROR});
  }
}
