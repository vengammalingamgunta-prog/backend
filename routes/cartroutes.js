import express from "express";

import {
  addToCart,
  getCart,
  updateCart,
  removeCartItem,
  clearCart
} from "../controllers/cartController.js";

const router = express.Router();

// Add product to cart
router.post("/add", addToCart);

// Get user's cart
router.get("/:userId", getCart);

// Update cart quantity
router.put("/item/:itemId", updateCart);

// Remove cart item
router.delete("/item/:itemId", removeCartItem);

// Clear user's cart
router.delete("/user/:userId", clearCart);

export default router;