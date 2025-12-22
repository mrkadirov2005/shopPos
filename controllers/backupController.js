import { client } from "../config/dbcon.js";

export const downloadDatabaseBackup = async (req, res) => {
    try {
        const tablesResult = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
        `);

        const tables = tablesResult.rows.map(r => r.tablename);
        const data = {};

        for (const table of tables) {
            const result = await client.query(`SELECT * FROM ${table}`);
            data[table] = result.rows;
        }

        const backup = {
            meta: {
                created_at: new Date().toISOString(),
                table_count: tables.length
            },
            data
        };

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=db-backup-${Date.now()}.json`
        );
        res.setHeader("Content-Type", "application/json");

        return res.status(200).send(JSON.stringify(backup, null, 2));

    } catch (err) {
        console.error("Backup error:", err);
        return res.status(500).json({ message: "Server Error" });
    }
};

