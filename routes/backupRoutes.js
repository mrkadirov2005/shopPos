import express from "express";
import { downloadDatabaseBackup } from "../controllers/backupController.js";
import { downloadSheetsBackup, restoreDatabaseBackup } from "../controllers/restoreController.js";
import fetch from "node-fetch"; // if your Node.js version < 18

const router = express.Router();

// Apply the increased limit ONLY to the restore route
router.post("/restore", 
  express.json({ limit: "50mb" }),  // Increased limit for restore only
  restoreDatabaseBackup
);

// Backup route keeps the default limit
router.post("/backup", downloadDatabaseBackup);
/// routes/backupProxyRoutes.js



const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzgckYdxmsw8WMCsK3bZkeKI1MXLhk2XAGhdxtnlBYdJRWDhN0Imh8arbuTC0qOmkAw/exec";

router.post("/backup-to-sheets", async (req, res) => {
  try {
    // Forward the JSON backup data to Google Apps Script
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    // Get the response from Google Apps Script
    const data = await response.json();

    // Forward the response back to the frontend
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error proxying backup to sheets:", error);
    res.status(500).json({ message: "Failed to backup to Google Sheets" });
  }
});

router.post("/restore-from-sheets", downloadSheetsBackup)



export default router;