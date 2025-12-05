import { errorMessages } from "../config/errorMessages.js";
import {client} from "./../config/dbcon.js"


export const createPermission = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Missing required field" });
  }

  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: errorMessages.MISSING_FIELDS });
  }

  try {
    const response = await client.query(
      "INSERT INTO permission (name) VALUES ($1) RETURNING *",
      [name]
    );
    return res.status(201).json({
      message: "Permission created successfully",
      permission: response.rows[0],
    });
  } catch (error) {
    console.error("Error creating permission:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Permission with this name already exists",
      });
    }
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getAllPermissions=async(req,res)=>{
  try {
    const response=await client.query("SELECT * FROM permission");
    if(response.rowCount==0){
      return res.status(400).json({message:"no permissions found",data:[]})
    }
    return res.status(200).json({message:"succesfully fetched the data",data:response.rows})
  } catch (error) {
    return res.status(400).json({message:"error",data:`${error}`})
  }
}