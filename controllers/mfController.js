import MutualFund from "../models/mf.js";
import {
  searchMutualFunds,
  getSchemeDetails,
  getLatestNAV as getLatestNAVService,
  getNAVHistory as getNAVHistoryService
} from "../services/mfapiservices.js";

// =====================================================
// 1. SEARCH MUTUAL FUNDS
// GET /api/mf/search?q=HDFC
// =====================================================
export const searchFunds = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required"
      });
    }

    const data = await searchMutualFunds(q.trim());

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error.message);

    if (error.response) {
      return res.status(error.response.status || 502).json({
        success: false,
        message: "MFAPI returned an error",
        error: error.response.data
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to search mutual funds",
      error: error.message
    });
  }
};

// =====================================================
// 2. GET SCHEME DETAILS + STORE IN MONGODB
// GET /api/mf/:schemeCode
// =====================================================
export const getScheme = async (req, res) => {
  try {
    const { schemeCode } = req.params;

    // 1. Validate parameter format
    if (!schemeCode || !/^\d+$/.test(schemeCode)) {
      return res.status(400).json({
        success: false,
        message: "Valid numeric scheme code is required"
      });
    }

    // 2. Fetch scheme details from service
    const apiResponse = await getSchemeDetails(schemeCode);

    // Extract metadata object (handles fetch or axios responses safely)
    const schemeInfo = apiResponse?.meta || apiResponse?.data?.meta;

    // Check if metadata exists
    if (!schemeInfo || !schemeInfo.scheme_code) {
      return res.status(404).json({
        success: false,
        message: `Mutual fund scheme with code ${schemeCode} not found`
      });
    }

    // 3. Structure data safely (normalizing null values)
    const fundData = {
      schemeCode: String(schemeInfo.scheme_code ?? schemeCode),
      schemeName: schemeInfo.scheme_name ?? "",
      fundHouse: schemeInfo.fund_house ?? "",
      schemeType: schemeInfo.scheme_type ?? "",
      schemeCategory: schemeInfo.scheme_category ?? "",
      isinGrowth: schemeInfo.isin_growth ?? "",
      isinDivReinvestment: schemeInfo.isin_div_reinvestment ?? ""
    };

    // 4. Upsert into MongoDB
    const mutualFund = await MutualFund.findOneAndUpdate(
      { schemeCode: fundData.schemeCode },
      fundData,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Mutual fund details fetched and stored successfully",
      apiUrl: `https://api.mfapi.in/mf/${schemeCode}`,
      data: {
        schemeDetails: fundData,
        databaseRecord: mutualFund
      }
    });

  } catch (error) {
    console.error("GET SCHEME ERROR:", error);

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: "Unable to connect to external Mutual Fund server. Please check your internet connection.",
        error: error.message
      });
    }

    if (error.response) {
      return res.status(error.response.status || 502).json({
        success: false,
        message: "External MF service returned an error",
        error: error.response.data
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get mutual fund details",
      error: error.message
    });
  }
};

// =====================================================
// 3. GET LATEST NAV + STORE IN MONGODB
// GET /api/mf/:schemeCode/latest
// =====================================================
export const getLatestNAV = async (req, res) => {
  try {
    const { schemeCode } = req.params;

    if (!schemeCode) {
      return res.status(400).json({
        success: false,
        message: "schemeCode is required"
      });
    }

    const data = await getLatestNAVService(schemeCode);

    if (!data || !data.data || data.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Latest NAV not found"
      });
    }

    return res.status(200).json({
      success: true,
      schemeName: data.meta?.scheme_name,
      apiUrl: `https://api.mfapi.in/mf/${schemeCode}/latest`,
      latestNAV: data.data[0]
    });

  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: "Unable to reach the Mutual Fund API server. Check your internet connection."
      });
    }

    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: "Mutual fund scheme not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// =====================================================
// 4. GET NAV HISTORY
// GET /api/mf/:schemeCode/nav-history
// =====================================================
export const getNAVHistory = async (req, res) => {
  try {
    const { schemeCode } = req.params;

    if (!schemeCode || !/^\d+$/.test(schemeCode)) {
      return res.status(400).json({
        success: false,
        message: "Valid scheme code is required"
      });
    }

    const data = await getNAVHistoryService(schemeCode);

    return res.status(200).json({
      success: true,
      apiUrl: `https://api.mfapi.in/mf/${schemeCode}`,
      data: data
    });
  } catch (error) {
    console.error("NAV HISTORY ERROR:", error.message);

    if (error.response) {
      return res.status(error.response.status || 502).json({
        success: false,
        message: "MFAPI returned an error",
        error: error.response.data
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get NAV history",
      error: error.message
    });
  }
};

// =====================================================
// 5. GET STORED MUTUAL FUNDS FROM MONGODB
// GET /api/mf
// =====================================================
export const getStoredFunds = async (req, res) => {
  try {
    const funds = await MutualFund.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: funds.length,
      data: funds
    });
  } catch (error) {
    console.error("GET STORED FUNDS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stored mutual funds",
      error: error.message
    });
  }
};