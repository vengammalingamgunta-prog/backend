import axios from "axios";

const BASE_URL = "https://api.mfapi.in";

export const searchMutualFunds = async (query) => {
  const url = `${BASE_URL}/mf/search`;
  const response = await axios.get(url, { params: { q: query } });
  return response.data;
};

export const getSchemeDetails = async (schemeCode) => {
  const response = await axios.get(`${BASE_URL}/mf/${schemeCode}`);
  return response.data;
};

// Fixed function name casing to match controller import
export const getLatestNAV = async (schemeCode) => {
  const response = await axios.get(`${BASE_URL}/mf/${schemeCode}/latest`);
  return response.data;
};

// Fixed function name casing to match controller import
export const getNAVHistory = async (schemeCode) => {
  const response = await axios.get(`${BASE_URL}/mf/${schemeCode}`);
  return response.data;
};

export const getNAVForDate = async (schemeCode, dateString) => {
  const historyData = await getNAVHistory(schemeCode);
  if (!historyData || !historyData.data) return null;
  return findNAVFromHistory(historyData.data, dateString);
};

// Added missing exported helper function required by controller
export const findNAVFromHistory = (navHistory, targetDateStr) => {
  if (!Array.isArray(navHistory) || navHistory.length === 0) return null;

  // Normalize YYYY-MM-DD input to DD-MM-YYYY for mfapi.in format
  let formattedTarget = targetDateStr;
  if (targetDateStr.includes("-") && targetDateStr.split("-")[0].length === 4) {
    const [year, month, day] = targetDateStr.split("-");
    formattedTarget = `${day}-${month}-${year}`;
  }

  // Look for exact date match first
  let entry = navHistory.find((item) => item.date === formattedTarget);
  if (entry) return entry;

  // Fallback: search for nearest previous available trading day
  const targetTime = new Date(targetDateStr).getTime();
  
  for (const item of navHistory) {
    const [d, m, y] = item.date.split("-");
    const itemTime = new Date(`${y}-${m}-${d}`).getTime();
    if (itemTime <= targetTime) {
      return item;
    }
  }

  return navHistory[0] || null;
};