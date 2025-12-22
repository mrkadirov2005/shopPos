// routes/debtRoutes.js
import express from "express";
import {
    getAllDebts,
    getDebtById,
    getDebtsByBranch,
    getDebtsByCustomer,
    getUnreturnedDebts,
    createDebt,
    updateDebt,
    markDebtAsReturned,
    deleteDebt,
    getDebtStatistics
} from "../controllers/debtcontroller.js";

const router = express.Router();

// GET routes
router.get("/all", getAllDebts);
router.get("/branch", getDebtsByBranch);
router.get("/unreturned", getUnreturnedDebts);
router.get("/statistics", getDebtStatistics);

// POST routes
router.post("/by-id", getDebtById);
router.post("/by-customer", getDebtsByCustomer);
router.post("/create", createDebt);
router.post("/update", updateDebt);
router.post("/mark-returned", markDebtAsReturned);

// DELETE routes
router.delete("/delete", deleteDebt);

export default router;