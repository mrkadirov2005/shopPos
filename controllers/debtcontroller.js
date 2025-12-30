// controllers/debtController.js
import { client } from "../config/dbcon.js";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../middleware/Logger.js";
import { extractJWT } from "../middleware/extractToken.js";

// Get all debts
export const getAllDebts = async (req, res) => {
    console.log("Fetching all debts");
    const { shop_id } = req.headers;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);

    if (!shop_id) {
        await logger(shop_id, user_id, "Get all debts failed - missing shop_id");
        return res.status(400).json({ message: "Missing shop_id" });
    }

    try {
        const result = await client.query(
            "SELECT * FROM debt_table WHERE shop_id = $1 ORDER BY year DESC, month DESC, day DESC",
            [shop_id]
        );

        await logger(shop_id, user_id, `Fetched all debts - count: ${result.rows.length}`);

        return res.status(200).json({
            message: "Successfully fetched debts",
            data: result.rows
        });
    } catch (err) {
        console.error("Error fetching debts:", err);
        await logger(shop_id, user_id, `Get all debts failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Get debt by ID
export const getDebtById = async (req, res) => {
    const { id } = req.body;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    if (!id) {
        await logger(shop_id, user_id, "Get debt by ID failed - missing debt ID");
        return res.status(400).json({ message: "Debt ID required" });
    }

    try {
        const result = await client.query(
            "SELECT * FROM debt_table WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            await logger(shop_id, user_id, `Get debt by ID failed - debt not found: ${id}`);
            return res.status(404).json({ message: "Debt not found" });
        }

        await logger(shop_id, user_id, `Fetched debt by ID: ${id}`);

        return res.status(200).json({
            message: "Successfully fetched debt",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Error fetching debt:", err);
        await logger(shop_id, user_id, `Get debt by ID failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Get debts by branch
export const getDebtsByBranch = async (req, res) => {
    const { branch_id } = req.headers;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    if (!branch_id) {
        await logger(shop_id, user_id, "Get debts by branch failed - missing branch_id");
        return res.status(400).json({ message: "Missing branch_id" });
    }

    try {
        const result = await client.query(
            "SELECT * FROM debt_table WHERE branch_id = $1 ORDER BY year DESC, month DESC, day DESC",
            [branch_id]
        );

        await logger(shop_id, user_id, `Fetched debts by branch: ${branch_id} - count: ${result.rows.length}`);

        return res.status(200).json({
            message: "Successfully fetched debts",
            data: result.rows
        });
    } catch (err) {
        console.error("Error fetching debts by branch:", err);
        await logger(shop_id, user_id, `Get debts by branch failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Get debts by customer name
export const getDebtsByCustomer = async (req, res) => {
    const { name, shop_id } = req.body;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);

    if (!name || !shop_id) {
        await logger(shop_id, user_id, "Get debts by customer failed - missing required fields");
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const result = await client.query(
            "SELECT * FROM debt_table WHERE name ILIKE $1 AND shop_id = $2 ORDER BY year DESC, month DESC, day DESC",
            [`%${name}%`, shop_id]
        );

        await logger(shop_id, user_id, `Fetched debts by customer: ${name} - count: ${result.rows.length}`);

        return res.status(200).json({
            message: "Successfully fetched debts",
            data: result.rows
        });
    } catch (err) {
        console.error("Error fetching debts by customer:", err);
        await logger(shop_id, user_id, `Get debts by customer failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Get unreturned debts
export const getUnreturnedDebts = async (req, res) => {
    const { shop_id } = req.headers;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);

    if (!shop_id) {
        await logger(shop_id, user_id, "Get unreturned debts failed - missing shop_id");
        return res.status(400).json({ message: "Missing shop_id" });
    }

    try {
        const result = await client.query(
            "SELECT * FROM debt_table WHERE shop_id = $1 AND isreturned = false ORDER BY year DESC, month DESC, day DESC",
            [shop_id]
        );

        await logger(shop_id, user_id, `Fetched unreturned debts - count: ${result.rows.length}`);

        return res.status(200).json({
            message: "Successfully fetched unreturned debts",
            data: result.rows
        });
    } catch (err) {
        console.error("Error fetching unreturned debts:", err);
        await logger(shop_id, user_id, `Get unreturned debts failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Create new debt
export const createDebt = async (req, res) => {
    const {
        name,
        amount,
        product_names,
        branch_id,
        shop_id,
        admin_id,
        isreturned = false
    } = req.body;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    

    // Validate required fields
    if (!name || !amount || !product_names || branch_id==null || !shop_id || !admin_id) {
        await logger(shop_id, user_id, "Create debt failed - missing required fields");
        return res.status(400).json({ message: "Missing required fields" });
    }

    const id = uuidv4();
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const query = `
        INSERT INTO debt_table (
            id, day, month, year, name, amount, product_names, 
            branch_id, shop_id, admin_id, isreturned
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
    `;

    const data=product_names.split(",").map(item=>item.trim())
    
    try {
        const result = await client.query(
            query,
            [id, day, month, year, name, amount, data, branch_id, shop_id, admin_id, isreturned]
        );

        await logger(shop_id, user_id, `Debt created successfully - customer: ${name}, amount: ${amount}`);

        return res.status(201).json({
            message: "Debt created successfully",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Error creating debt:", err);
        await logger(shop_id, user_id, `Create debt failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Update debt
export const updateDebt = async (req, res) => {
    const {
        id,
        name,
        amount,
        product_names,
        branch_id,
        isreturned
    } = req.body;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    if (!id) {
        await logger(shop_id, user_id, "Update debt failed - missing debt ID");
        return res.status(400).json({ message: "Debt ID is required" });
    }

    const query = `
        UPDATE debt_table
        SET
            name = COALESCE($1, name),
            amount = COALESCE($2, amount),
            product_names = COALESCE($3, product_names),
            branch_id = COALESCE($4, branch_id),
            isreturned = COALESCE($5, isreturned)
        WHERE id = $6
        RETURNING *;
    `;

    try {
        const result = await client.query(
            query,
            [name, amount, product_names, branch_id, isreturned, id]
        );

        if (result.rows.length === 0) {
            await logger(shop_id, user_id, `Update debt failed - debt not found: ${id}`);
            return res.status(404).json({ message: "Debt not found" });
        }

        await logger(shop_id, user_id, `Debt updated successfully: ${id}`);

        return res.status(200).json({
            message: "Debt updated successfully",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Error updating debt:", err);
        await logger(shop_id, user_id, `Update debt failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Mark debt as returned
export const markDebtAsReturned = async (req, res) => {
    const { id } = req.body;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    if (!id) {
        await logger(shop_id, user_id, "Mark debt as returned failed - missing debt ID");
        return res.status(400).json({ message: "Debt ID is required" });
    }

    try {
        const result = await client.query(
            "UPDATE debt_table SET isreturned = true WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            await logger(shop_id, user_id, `Mark debt as returned failed - debt not found: ${id}`);
            return res.status(404).json({ message: "Debt not found" });
        }

        await logger(shop_id, user_id, `Debt marked as returned: ${id} - customer: ${result.rows[0].name}`);

        return res.status(200).json({
            message: "Debt marked as returned successfully",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Error marking debt as returned:", err);
        await logger(shop_id, user_id, `Mark debt as returned failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Delete debt
export const deleteDebt = async (req, res) => {
    const { id } = req.headers;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    if (!id) {
        await logger(shop_id, user_id, "Delete debt failed - missing debt ID");
        return res.status(400).json({ message: "Debt ID required" });
    }

    try {
        const result = await client.query(
            "DELETE FROM debt_table WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            await logger(shop_id, user_id, `Delete debt failed - debt not found: ${id}`);
            return res.status(404).json({ message: "Debt not found" });
        }

        await logger(shop_id, user_id, `Debt deleted successfully: ${id} - customer: ${result.rows[0].name}`);

        return res.status(200).json({
            message: "Debt deleted successfully",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Error deleting debt:", err);
        await logger(shop_id, user_id, `Delete debt failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Get debt statistics
export const getDebtStatistics = async (req, res) => {
    const { shop_id } = req.headers;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);

    if (!shop_id) {
        await logger(shop_id, user_id, "Get debt statistics failed - missing shop_id");
        return res.status(400).json({ message: "Missing shop_id" });
    }

    const query = `
        SELECT 
            COUNT(*) as total_debts,
            SUM(CASE WHEN isreturned = false THEN 1 ELSE 0 END) as unreturned_count,
            SUM(CASE WHEN isreturned = true THEN 1 ELSE 0 END) as returned_count,
            SUM(amount) as total_amount,
            SUM(CASE WHEN isreturned = false THEN amount ELSE 0 END) as unreturned_amount,
            SUM(CASE WHEN isreturned = true THEN amount ELSE 0 END) as returned_amount
        FROM debt_table
        WHERE shop_id = $1;
    `;

    try {
        const result = await client.query(query, [shop_id]);

        await logger(shop_id, user_id, "Fetched debt statistics");

        return res.status(200).json({
            message: "Successfully fetched statistics",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("Error fetching debt statistics:", err);
        await logger(shop_id, user_id, `Get debt statistics failed - error: ${err.message}`);
        return res.status(500).json({ message: "Server Error" });
    }
};