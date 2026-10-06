import mongoose from "mongoose";

const mutualFundSchema = new mongoose.Schema(
  {
    schemeCode: {
      type: String,
      required: [true, "Scheme code is required"],
      unique: true,
      trim: true
    },
    schemeName: {
      type: String,
      required: [true, "Scheme name is required"],
      trim: true
    },
    fundHouse: {
      type: String,
      default: ""
    },
    schemeType: {
      type: String,
      default: ""
    },
    schemeCategory: {
      type: String,
      default: ""
    },
    isinGrowth: {
      type: String,
      default: ""
    },
    isinDivReinvestment: {
      type: String,
      default: ""
    },
    latestNav: {
      type: Number,
      default: null
    },
    latestNavDate: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const MutualFund = mongoose.model("MutualFund", mutualFundSchema);
export default MutualFund;