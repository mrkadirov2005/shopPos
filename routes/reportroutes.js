import express from "express"
import { getShopReports } from "../controllers/reportscontroller.js";
const router=express.Router()
router.post("/shop",getShopReports)
export default router;
