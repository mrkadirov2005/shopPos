// controllers/debtController.js
import { client } from "../config/dbcon.js";
import { v4 as uuidv4 } from "uuid";

// Get all debts
export const getAllDebts = (req, res) => {
    console.log("Fetching all debts");
    const { shop_id } = req.headers;

    if (!shop_id) {
        return res.status(400).json({ message: "Missing shop_id" });
    }

    client.query(
        "SELECT * FROM debt_table WHERE shop_id = $1 ORDER BY year DESC, month DESC, day DESC",
        [shop_id],
        (err, result) => {
            if (err) {
                console.error("Error fetching debts:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            return res.status(200).json({
                message: "Successfully fetched debts",
                data: result.rows
            });
        }
    );
};

// Get debt by ID
export const getDebtById = (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Debt ID required" });
    }

    client.query(
        "SELECT * FROM debt_table WHERE id = $1",
        [id],
        (err, result) => {
            if (err) {
                console.error("Error fetching debt:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Debt not found" });
            }

            return res.status(200).json({
                message: "Successfully fetched debt",
                data: result.rows[0]
            });
        }
    );
};

// Get debts by branch
export const getDebtsByBranch = (req, res) => {
    const { branch_id } = req.headers;

    if (!branch_id) {
        return res.status(400).json({ message: "Missing branch_id" });
    }

    client.query(
        "SELECT * FROM debt_table WHERE branch_id = $1 ORDER BY year DESC, month DESC, day DESC",
        [branch_id],
        (err, result) => {
            if (err) {
                console.error("Error fetching debts by branch:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            return res.status(200).json({
                message: "Successfully fetched debts",
                data: result.rows
            });
        }
    );
};

// Get debts by customer name
export const getDebtsByCustomer = (req, res) => {
    const { name, shop_id } = req.body;

    if (!name || !shop_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    client.query(
        "SELECT * FROM debt_table WHERE name ILIKE $1 AND shop_id = $2 ORDER BY year DESC, month DESC, day DESC",
        [`%${name}%`, shop_id],
        (err, result) => {
            if (err) {
                console.error("Error fetching debts by customer:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            return res.status(200).json({
                message: "Successfully fetched debts",
                data: result.rows
            });
        }
    );
};

// Get unreturned debts
export const getUnreturnedDebts = (req, res) => {
    const { shop_id } = req.headers;

    if (!shop_id) {
        return res.status(400).json({ message: "Missing shop_id" });
    }

    client.query(
        "SELECT * FROM debt_table WHERE shop_id = $1 AND isreturned = false ORDER BY year DESC, month DESC, day DESC",
        [shop_id],
        (err, result) => {
            if (err) {
                console.error("Error fetching unreturned debts:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            return res.status(200).json({
                message: "Successfully fetched unreturned debts",
                data: result.rows
            });
        }
    );
};

// Create new debt
export const createDebt = (req, res) => {
    const {
        name,
        amount,
        product_names,
        branch_id,
        shop_id,
        admin_id,
        isreturned = false
    } = req.body;
    

    // Validate required fields
    if (!name || !amount || !product_names || branch_id==null || !shop_id || !admin_id) {
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
    client.query(
        query,
        [id, day, month, year, name, amount, data, branch_id, shop_id, admin_id, isreturned],
        (err, result) => {
            if (err) {
                console.error("Error creating debt:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            return res.status(201).json({
                message: "Debt created successfully",
                data: result.rows[0]
            });
        }
    );
};

// Update debt
export const updateDebt = (req, res) => {
    const {
        id,
        name,
        amount,
        product_names,
        branch_id,
        isreturned
    } = req.body;

    if (!id) {
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

    client.query(
        query,
        [name, amount, product_names, branch_id, isreturned, id],
        (err, result) => {
            if (err) {
                console.error("Error updating debt:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Debt not found" });
            }

            return res.status(200).json({
                message: "Debt updated successfully",
                data: result.rows[0]
            });
        }
    );
};

// Mark debt as returned
export const markDebtAsReturned = (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Debt ID is required" });
    }

    client.query(
        "UPDATE debt_table SET isreturned = true WHERE id = $1 RETURNING *",
        [id],
        (err, result) => {
            if (err) {
                console.error("Error marking debt as returned:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Debt not found" });
            }

            return res.status(200).json({
                message: "Debt marked as returned successfully",
                data: result.rows[0]
            });
        }
    );
};

// Delete debt
export const deleteDebt = (req, res) => {
    const { id } = req.headers;

    if (!id) {
        return res.status(400).json({ message: "Debt ID required" });
    }

    client.query(
        "DELETE FROM debt_table WHERE id = $1 RETURNING *",
        [id],
        (err, result) => {
            if (err) {
                console.error("Error deleting debt:", err);
                return res.status(500).json({ message: "Server Error" });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Debt not found" });
            }

            return res.status(200).json({
                message: "Debt deleted successfully",
                data: result.rows[0]
            });
        }
    );
};

// Get debt statistics
export const getDebtStatistics = (req, res) => {
    const { shop_id } = req.headers;

    if (!shop_id) {
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

    client.query(query, [shop_id], (err, result) => {
        if (err) {
            console.error("Error fetching debt statistics:", err);
            return res.status(500).json({ message: "Server Error" });
        }

        return res.status(200).json({
            message: "Successfully fetched statistics",
            data: result.rows[0]
        });
    });
};