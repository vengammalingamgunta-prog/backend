import express from "express";
import {
    calculateLumpsum,
    calculateSIP
} from "../controllers/investmentController.js";

const router = express.Router();

// Example request: GET /lumpsum/100023?amount=100000&duration=5
router.get("/lumpsum/:schemeCode", calculateLumpsum);

// Example request: GET /sip/100023?monthlyInvestment=5000&months=12
router.get("/sip/:schemeCode", calculateSIP);

export default router;