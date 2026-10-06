import express from "express";

// Import controller functions
import {
  searchFunds,
  getScheme,
  getLatestNAV,
  getNAVHistory,
  getStoredFunds
} from "../controllers/mfcontroller.js";

const router = express.Router({ caseSensitive: false });

// 1. Static & Root Routes First
// GET /api/mf
router.get("/", getStoredFunds);

// GET /api/mf/search?q=HDFC
router.get("/search", searchFunds);

// 2. Specific Sub-paths with Dynamic Parameters
// GET /api/mf/120503/latest
router.get("/:schemeCode/latest", getLatestNAV);

// GET /api/mf/120503/nav-history
router.get("/:schemeCode/nav-history", getNAVHistory);

// 3. Catch-all Parameterized Routes Last
// GET /api/mf/120503
router.get("/:schemeCode", getScheme);

export default router;