import { errorMessages } from "../config/errorMessages.js";
import {client} from "./../config/dbcon.js";
import { logger } from "../middleware/Logger.js";
import { extractJWT } from "../middleware/extractToken.js";


export const createPermission = async (req, res) => {
  const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
  const shop_id = req.headers["shop_id"] || null;

  if (!req.body) {
    await logger(shop_id, user_id, "Create permission failed - missing request body");
    return res.status(400).json({ message: "Missing required field" });
  }

  const { name } = req.body;

  if (!name) {
    await logger(shop_id, user_id, "Create permission failed - missing name");
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    const response = await client.query(
      "INSERT INTO permission (name) VALUES ($1) RETURNING *",
      [name]
    );
    await logger(shop_id, user_id, `Permission created successfully: ${name}`);
    return res.status(201).json({
      message: "Permission created successfully",
      permission: response.rows[0],
    });
  } catch (error) {
    console.error("Error creating permission:", error);

    if (error.code === "23505") {
      await logger(shop_id, user_id, `Create permission failed - permission already exists: ${name}`);
      return res.status(409).json({
        message: "Permission with this name already exists",
      });
    }
    await logger(shop_id, user_id, `Create permission failed - error: ${error.message}`);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getAllPermissions=async(req,res)=>{
  const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
  const shop_id = req.headers["shop_id"] || null;

  try {
    const response=await client.query("SELECT * FROM permission");
    if(response.rowCount==0){
      await logger(shop_id, user_id, "Get all permissions - no permissions found");
      return res.status(200).json({message:"no permissions found",data:[]})
    }
    await logger(shop_id, user_id, `Fetched all permissions - count: ${response.rows.length}`);
    return res.status(200).json({message:"succesfully fetched the data",data:response.rows})
  } catch (error) {
    await logger(shop_id, user_id, `Get all permissions failed - error: ${error.message}`);
    return res.status(400).json({message:"error",data:`${error}`})
  }
}