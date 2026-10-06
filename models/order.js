import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"]
    },
    name: {
      type: String,
      required: [true, "Product name is required"]
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"]
    },
    price: {
      type: Number,
      required: [true, "Price is required"]
    },
    total: {
      type: Number,
      required: [true, "Total is required"]
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"]
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order items are required"],
      validate: [
        (array) => array.length > 0,
        "Order must contain at least one item"
      ]
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"]
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        message:
          "Status must be one of: pending, confirmed, shipped, delivered, cancelled"
      },
      default: "pending"
    },
    shippingAddress: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Shipping address is required"]
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;