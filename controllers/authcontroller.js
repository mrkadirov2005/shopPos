import { client } from '../config/dbcon.js';
import {errorMessages} from "./../config/errorMessages.js"
import jwt from "jsonwebtoken";
import { JWTKEYS } from '../config/JWT_keys.js';

export const generateSuperAdminToken = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  const { uuid, name, phonenumber, password } = req.body;

  if (!uuid || !name || !phonenumber || !password) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    // 1. Check if superuser exists
    const isSuperUserFound = await client.query(
      "SELECT * FROM superuser WHERE uuid = $1",
      [uuid]
    );

    if (isSuperUserFound.rows.length === 0) {
      return res.status(404).json({ message: "Super Admin not found" });
    }

    // 2. Generate Tokens (never include password)
    const refreshToken = jwt.sign(
      { uuid, name, phonenumber,role:"superuser" },
      JWTKEYS.jwt_key,
      { expiresIn: "7d" }
    );

    const accessToken = jwt.sign(
      { uuid, name, phonenumber,role:"superuser" },
      JWTKEYS.jwt_key,
      { expiresIn: "1d" }
    );

    // 3. Save tokens in database
    await client.query(
      `UPDATE superuser
       SET refreshtoken = $1, accesstoken = $2
       WHERE uuid = $3`,
      [refreshToken, accessToken, uuid]
    );

    // 4. Return tokens
    return res.status(200).json({
      message: "Tokens generated",
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error("Token generation error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const generateAdminToken = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  const { uuid, name, phonenumber, password } = req.body;

  if (!uuid || !name || !phonenumber || !password) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    // 1. Check if admin exists
    const isAdminFound = await client.query(
      "SELECT * FROM admin WHERE uuid = $1",
      [uuid]
    );

    if (isAdminFound.rows.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 2. Generate Tokens (never include password)
    const refreshToken = jwt.sign(
      { uuid, name, phonenumber,role:"admin" },
      JWTKEYS.jwt_key,
      { expiresIn: "7d" }
    );

    const accessToken = jwt.sign(
      { uuid, name, phonenumber,role:"admin" },
      JWTKEYS.jwt_key,
      { expiresIn: "1d" }
    );
    return res.status(200).json({
      message: "Tokens generated",
      accessToken,
      refreshToken
    });

  }
  catch (error) {
    console.error("Token generation error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
}

export const loginSuperUser=async(req,res)=>{

  if(!req.body){
    return res.status(400).json({message:errorMessages.MISSING_FIELDS});
  }

  const {uuid,phonenumber,name}=req.body;
  if(!uuid || !phonenumber || !name){
    return res.status(400).json({message:errorMessages.MISSING_FIELDS});
  }

 //check if this superuser exists
  const isSuperUserFound=await client.query(
    "SELECT * FROM superuser WHERE uuid=$1 ",
    [uuid]
  );
  // generate the access token the refresh token is alrady generated and available in db
  if(isSuperUserFound.rows.length===0){
    return res.status(404).json({message:"Superuser not found"});
  }
  const accessToken=jwt.sign(
    {uuid,name,phonenumber,role:"superuser"},
    JWTKEYS.jwt_key,
    {expiresIn:"1d"}
  );
  //update the access token in db but while sending send both refresh and access token
  await client.query(
    `UPDATE superuser
     SET accesstoken=$1
     WHERE uuid=$2`,
     [accessToken,uuid]
  );
  return res.status(200).json({
    message:"Login successful",
    accessToken:accessToken,
    refreshToken:isSuperUserFound.rows[0].refreshtoken,
    user:isSuperUserFound.rows[0]
  });
  

 
}

export const loginAdmin=async(req,res)=>{
  // apply the same logic as login superuser
  if(!req.body){
    return res.status(400).json({message:errorMessages.MISSING_FIELDS});
  }

  const {uuid,phonenumber,name}=req.body;
  if(!uuid || !phonenumber || !name){
    return res.status(400).json({message:errorMessages.MISSING_FIELDS});
  }

 //check if this admin exists
  const isAdminFound=await client.query(
    "SELECT * FROM admin WHERE uuid=$1 ",
    [uuid]
  );
  // generate the access token the refresh token is alrady generated and available in db
  if(isAdminFound.rows.length===0){
    return res.status(404).json({message:"Admin not found"});
  }
  const accessToken=jwt.sign(
    {uuid,name,phonenumber,role:"admin"},
    JWTKEYS.jwt_key,
    {expiresIn:"1d"}
  );
  //update the access token in db but while sending send both refresh and access token
  await client.query(
    `UPDATE admin
     SET accesstoken=$1
     WHERE uuid=$2`,
     [accessToken,uuid]
  );
  return res.status(200).json({
    message:"Login successful",
    accessToken,
    refreshToken:isAdminFound.rows[0].refreshtoken,
    user:isAdminFound.rows[0]
  });
  
}
