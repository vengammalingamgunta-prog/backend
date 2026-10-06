import express from "express";

import {
  createOrder,
  getUserOrders,
  getAdminOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder
} from "../controllers/orderController.js";

const router = express.Router();

// ======================================
// CREATE ORDER
// POST /api/order/create
// ======================================
router.post(
  "/create",
  createOrder
);

// ======================================
// CUSTOMER ORDERS
// GET /api/order/user/:userId
// ======================================
router.get(
  "/user/:userId",
  getUserOrders
);

// ======================================
// ADMIN ORDERS
// GET /api/order/admin
// ======================================
router.get(
  "/admin",
  getAdminOrders
);

// ======================================
// GET ORDER BY ID
// GET /api/order/:id
// ======================================
router.get(
  "/:id",
  getOrderById
);

// ======================================
// UPDATE ORDER STATUS
// PUT /api/order/:id/status
// ======================================
router.put(
  "/:id/status",
  updateOrderStatus
);

// ======================================
// CANCEL ORDER
// PUT /api/order/:id/cancel
// ======================================
router.put(
  "/:id/cancel",
  cancelOrder
);

// ======================================
// DELETE ORDER
// DELETE /api/order/:id
// ======================================
router.delete(
  "/:id",
  deleteOrder
);

export default router;