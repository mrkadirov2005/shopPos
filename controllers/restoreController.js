import { client } from "../config/dbcon.js";
import { logger } from "../middleware/Logger.js";
import { extractJWT } from "../middleware/extractToken.js";

export const restoreDatabaseBackup = async (req, res) => {
    const { data } = req.body;
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    if (!data || typeof data !== "object") {
        await logger(shop_id, user_id, "Database restore failed - invalid backup file");
        return res.status(400).json({ message: "Invalid backup file" });
    }

    try {
        await client.query("BEGIN");

        for (const tableName of Object.keys(data)) {
            const rows = data[tableName];
            if (!Array.isArray(rows)) continue;

            // Clear table
            await client.query(`DELETE FROM ${tableName}`);

            for (const row of rows) {
                const columns = Object.keys(row);
                const values = Object.values(row);

                if (columns.length === 0) continue;

                const placeholders = columns.map((_, i) => `$${i + 1}`).join(",");

                const query = `
                    INSERT INTO ${tableName} (${columns.join(",")})
                    VALUES (${placeholders})
                `;

                await client.query(query, values);
            }
        }

        await client.query("COMMIT");

        await logger(shop_id, user_id, `Database restored successfully - tables: ${Object.keys(data).length}`);

        return res.status(200).json({
            message: "Database restored successfully"
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Restore error:", err);

        await logger(shop_id, user_id, `Database restore failed - error: ${err.message}`);

        return res.status(500).json({
            message: "Restore failed"
        });
    }
};






import fetch from "node-fetch";

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzgckYdxmsw8WMCsK3bZkeKI1MXLhk2XAGhdxtnlBYdJRWDhN0Imh8arbuTC0qOmkAw/exec";

export const downloadSheetsBackup = async (req, res) => {
    const user_id = req.headers["uuid"] || extractJWT(req.headers["authorization"]);
    const shop_id = req.headers["shop_id"] || null;

    try {
        console.log("📥 Fetching data from Google Sheets...");
        
        // Fetch data from Google Sheets
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, { 
            method: "GET",
            timeout: 30000 
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch from Google Sheets: HTTP ${response.status}`);
        }

        const sheetsData = await response.json();
        
        // Get the data object from the response
        const data = sheetsData.data || sheetsData;
        
        if (!data || typeof data !== "object") {
            throw new Error("No valid data found in Google Sheets response");
        }

        console.log(`📊 Found ${Object.keys(data).length} sheets/tables`);
        
        // Count total rows
        let totalRows = 0;
        for (const tableName of Object.keys(data)) {
            if (Array.isArray(data[tableName])) {
                totalRows += data[tableName].length;
            }
        }

        // Create the backup object
        const backup = {
            meta: {
                source: "google_sheets",
                fetched_at: new Date().toISOString(),
                sheet_count: Object.keys(data).length,
                total_rows: totalRows,
                url: GOOGLE_APPS_SCRIPT_URL
            },
            data
        };

        // Convert to formatted JSON string
        const jsonString = JSON.stringify(backup, null, 2);
        
        // Set headers for file download
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=google-sheets-backup-${timestamp}.json`
        );
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Length", Buffer.byteLength(jsonString));

        // Send the file
        console.log(`✅ Sending backup file: ${Object.keys(data).length} sheets, ${totalRows} total rows`);
        await logger(shop_id, user_id, `Google Sheets backup downloaded - sheets: ${Object.keys(data).length}, rows: ${totalRows}`);
        return res.status(200).send(jsonString);

    } catch (error) {
        console.error("❌ Backup from Google Sheets failed:", error.message);
        await logger(shop_id, user_id, `Google Sheets backup failed - error: ${error.message}`);
        
        return res.status(500).json({ 
            message: "Failed to backup from Google Sheets",
            error: error.message
        });
    }
};