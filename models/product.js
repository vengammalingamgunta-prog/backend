import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Product Name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Product Description Object
    description: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Product Price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Available Stock
    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    // Product Status
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // Product Category
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Product Image
    image: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent OverwriteModelError
const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

export default Product;