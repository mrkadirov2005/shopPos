import { JWTKEYS } from "../config/JWT_keys.js"
import {client} from "./../config/dbcon.js";
import {v4 as uuidv4} from "uuid";
import { logger } from "../middleware/Logger.js";
import { extractJWT } from "../middleware/extractToken.js";

export const getShops = async (req, res) => {
    
    const sk=JWTKEYS.CTO;
   
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const secret_key=req.headers["secret_key"];
    if(!secret_key){
        await logger(null, user_id, "Get shops failed - missing secret key");
        return res.status(400).json({message:"Missing fields"});
    }
    if(secret_key!==sk){
        await logger(null, user_id, "Get shops failed - unauthorized access");
        return res.status(401).json({message:"Unauthorized access"});
    }

    try {
        const result = await client.query("SELECT * FROM shopname");
        await logger(null, user_id, `Fetched all shops - count: ${result.rows.length}`);
        return res.status(200).json({shops:result.rows});
    } catch (err) {
        console.error("Error fetching shops:", err);
        await logger(null, user_id, `Get shops failed - error: ${err.message}`);
        return res.status(500).json({message:"Server Error"});
    }
}
 export const getShopBranches = async (req, res) => {
    const shop_id = req.headers["shop_id"];
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);

    // Validate shop_id
    if (!shop_id) {
        await logger(shop_id, user_id, "Get shop branches failed - missing shop_id");
        return res.status(400).json({ message: "Missing shop_id" });
    }

    try {
        const result = await client.query(
            "SELECT * FROM branches WHERE shop_id = $1",
            [shop_id]
        );

        // If no branches found
        if (result.rows.length === 0) {
            await logger(shop_id, user_id, "Get shop branches - no branches found");
            return res.status(404).json({ message: "No branches found for this shop" });
        }

        await logger(shop_id, user_id, `Fetched shop branches - count: ${result.rows.length}`);

        // Success
        return res.status(200).json({message:"Successfully fetched the data", data: result.rows });
    } catch (err) {
        console.error("Error fetching branches:", err);
        await logger(shop_id, user_id, `Get shop branches failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};


export const createBranch = async (req, res) => {
    const { name, location, employees, shop_id } = req.body;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
  
    if (!name || !location || !employees || !shop_id) {
        await logger(shop_id, user_id, "Create branch failed - missing required fields");
        return res.status(400).json({ message: "Missing required fields" });
    }
    const uuid=uuidv4()

    const query = `
        INSERT INTO branches (name, location, employees, shop_id,id)
        VALUES ($1, $2, $3, $4,$5)
        RETURNING *;
    `;

    try {
        const result = await client.query(query, [name, location, employees, shop_id, uuid]);

        await logger(shop_id, user_id, `Branch created successfully: ${name}`);

        return res.status(201).json({
            message: "Branch created successfully",
            branch: result.rows[0]
        });
    } catch (err) {
        console.error("Error creating branch:", err);
        await logger(shop_id, user_id, `Create branch failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};


export const updateBranch = async (req, res) => {
    const { id } = req.body; // branch id
    const { name, location, employees } = req.body;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    if (!id) {
        await logger(shop_id, user_id, "Update branch failed - missing branch ID");
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

    try {
        const result = await client.query(query, [name, location, employees, id]);

        if (result.rows.length === 0) {
            await logger(shop_id, user_id, `Update branch failed - branch not found: ${id}`);
            return res.status(404).json({ message: "Branch not found" });
        }

        await logger(shop_id, user_id, `Branch updated successfully: ${result.rows[0].name}`);

        return res.status(200).json({
            message: "Branch updated successfully",
            branch: result.rows[0]
        });
    } catch (err) {
        console.error("Error updating branch:", err);
        await logger(shop_id, user_id, `Update branch failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};


export const deleteBranch = async (req, res) => {
    const { id } = req.headers;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    if (!id) {
        await logger(shop_id, user_id, "Delete branch failed - missing branch ID");
        return res.status(400).json({ message: "Branch ID required" });
    }

    try {
        const result = await client.query("DELETE FROM branches WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            await logger(shop_id, user_id, `Delete branch failed - branch not found: ${id}`);
            return res.status(404).json({ message: "Branch not found" });
        }

        await logger(shop_id, user_id, `Branch deleted successfully: ${result.rows[0].name}`);

        return res.status(200).json({
            message: "Branch deleted successfully",
            deletedBranch: result.rows[0]
        });
    } catch (err) {
        console.error("Error deleting branch:", err);
        await logger(shop_id, user_id, `Delete branch failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};


export const getBranchById = async (req, res) => {
    const { id } = req.body;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    if (!id) {
        await logger(shop_id, user_id, "Get branch by ID failed - missing branch ID");
        return res.status(400).json({ message: "Branch ID required" });
    }

    try {
        const result = await client.query("SELECT * FROM branches WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            await logger(shop_id, user_id, `Get branch by ID failed - branch not found: ${id}`);
            return res.status(404).json({ message: "Branch not found" });
        }

        await logger(shop_id, user_id, `Fetched branch by ID: ${result.rows[0].name}`);

        return res.status(200).json({
            branch: result.rows[0]
        });
    } catch (err) {
        console.error("Error fetching branch:", err);
        await logger(shop_id, user_id, `Get branch by ID failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};
