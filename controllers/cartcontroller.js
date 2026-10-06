import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import User from "../models/user.js";
import Product from "../models/Product.js";

// =========================
// ADD PRODUCT TO CART
// POST /api/cart/add
// =========================
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "userId, productId and quantity are required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or productId",
      });
    }

    // Check user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // FIXED: Product schema uses status
    if (product.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Product is not active",
      });
    }

    // Check stock
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot exceed available stock",
      });
    }

    // Check existing cart item
    const existingCart = await Cart.findOne({
      userId,
      productId,
    });

    if (existingCart) {
      const newQuantity = existingCart.quantity + quantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Quantity cannot exceed available stock",
        });
      }

      existingCart.quantity = newQuantity;
      existingCart.price = product.price;

      await existingCart.save();

      return res.status(200).json({
        success: true,
        message: "Cart quantity updated",
        cart: existingCart,
      });
    }

    // Create new cart item
    const cart = await Cart.create({
      userId,
      productId,
      quantity,
      price: product.price,
    });

    return res.status(201).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// GET USER CART
// GET /api/cart/:userId
// =========================
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const cart = await Cart.find({ userId }).populate("productId");

    return res.status(200).json({
      success: true,
      count: cart.length,
      cart,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// UPDATE CART QUANTITY
// PUT /api/cart/item/:itemId
// =========================
export const updateCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const cart = await Cart.findById(itemId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    const product = await Product.findById(cart.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Product is not active",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot exceed available stock",
      });
    }

    cart.quantity = quantity;
    cart.price = product.price;

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Update Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// REMOVE CART ITEM
// DELETE /api/cart/item/:itemId
// =========================
export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart item ID",
      });
    }

    const cart = await Cart.findByIdAndDelete(itemId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
    });
  } catch (error) {
    console.error("Remove Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// CLEAR USER CART
// DELETE /api/cart/user/:userId
// =========================
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    await Cart.deleteMany({ userId });

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};