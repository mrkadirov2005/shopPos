import { JWTKEYS } from "../config/JWT_keys.js"
import {client} from "./../config/dbcon.js";
import {v4 as uuidv4} from "uuid"
export const getShops = (req, res) => {
    
    const sk=JWTKEYS.CTO;
   
    
    const secret_key=req.headers["secret_key"];
    if(!secret_key){
        return res.status(400).json({message:"Missing fields"});
    }
    if(secret_key!==sk){
        return res.status(401).json({message:"Unauthorized access"});
    }
// fetch all shops and return
    client.query("SELECT * FROM shopname",(err,result)=>{
        if(err){
            console.error("Error fetching shops:",err);
            return res.status(500).json({message:"Server Error"});
        }
        return  res.status(200).json({shops:result.rows});
    })


    }
 export const getShopBranches = (req, res) => {
    const shop_id = req.headers["shop_id"];

    // Validate shop_id
    if (!shop_id) {
        return res.status(400).json({ message: "Missing shop_id" });
    }

    // Query DB for branches of this shop
    client.query(
        "SELECT * FROM branches WHERE shop_id = $1",
        [shop_id],
        (err, result) => {
            if (err) {
                console.error("Error fetching branches:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            // If no branches found
            if (result.rows.length === 0) {
                return res.status(404).json({ message: "No branches found for this shop" });
            }

            // Success
            return res.status(200).json({ branches: result.rows });
        }
    );
};


export const createBranch = (req, res) => {
    const { name, location, employees, shop_id } = req.body;
  
    if (!name || !location || !employees || !shop_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const uuid=uuidv4()

    const query = `
        INSERT INTO branches (name, location, employees, shop_id,id)
        VALUES ($1, $2, $3, $4,$5)
        RETURNING *;
    `;

    client.query(query, [name, location, employees, shop_id,uuid], (err, result) => {
        if (err) {
            console.error("Error creating branch:", err);
            return res.status(500).json({ message: "Server Error" });
        }

        return res.status(201).json({
            message: "Branch created successfully",
            branch: result.rows[0]
        });
    });
};


export const updateBranch = (req, res) => {
    const { id } = req.body; // branch id
    const { name, location, employees } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Branch ID is required" });
    }

    const query = `
        UPDATE branches
        SET
            name = COALESCE($1, name),
            location = COALESCE($2, location),
            employees = COALESCE($3, employees)
        WHERE id = $4
        RETURNING *;
    `;

    client.query(query, [name, location, employees, id], (err, result) => {
        if (err) {
            console.error("Error updating branch:", err);
            return res.status(500).json({ message: "Server Error" });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Branch not found" });
        }

        return res.status(200).json({
            message: "Branch updated successfully",
            branch: result.rows[0]
        });
    });
};


export const deleteBranch = (req, res) => {
    const { id } = req.headers;

    if (!id) {
        return res.status(400).json({ message: "Branch ID required" });
    }

    client.query("DELETE FROM branches WHERE id = $1 RETURNING *", [id], (err, result) => {
        if (err) {
            console.error("Error deleting branch:", err);
            return res.status(500).json({ message: "Server Error" });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Branch not found" });
        }

        return res.status(200).json({
            message: "Branch deleted successfully",
            deletedBranch: result.rows[0]
        });
    });
};


export const getBranchById = (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Branch ID required" });
    }

    client.query("SELECT * FROM branches WHERE id = $1", [id], (err, result) => {
        if (err) {
            console.error("Error fetching branch:", err);
            return res.status(500).json({ message: "Server Error" });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Branch not found" });
        }

        return res.status(200).json({
            branch: result.rows[0]
        });
    });
};
