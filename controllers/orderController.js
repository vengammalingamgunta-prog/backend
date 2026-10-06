import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/user.js";

// Helper for standardized API responses
const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};

// ======================================
// 1. CREATE ORDER
// POST /api/order/create
// ======================================
export const createOrder = async (req, res) => {
  try {
    const { userId, shippingAddress } = req.body;

    // Check required fields
    if (!userId || !shippingAddress) {
      return sendResponse(
        res,
        400,
        false,
        "userId and shippingAddress are required"
      );
    }

    // Check user
    const user = await User.findById(userId);

    if (!user) {
      return sendResponse(
        res,
        404,
        false,
        "User not found"
      );
    }

    // Get cart items from MongoDB
    const cartItems = await Cart.find({ userId });

    if (!cartItems || cartItems.length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "Cart is empty. Cannot create an order"
      );
    }

    let calculatedTotal = 0;
    const orderItems = [];

    // Check every cart item
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return sendResponse(
          res,
          404,
          false,
          "Product not found in system"
        );
      }

      // Check product status
      if (product.status !== "active") {
        return sendResponse(
          res,
          400,
          false,
          `Product '${product.name}' is no longer active`
        );
      }

      const qty = item.quantity || 1;

      // Check stock
      if (product.stock < qty) {
        return sendResponse(
          res,
          400,
          false,
          `Insufficient stock for '${product.name}'. Available: ${product.stock}, Requested: ${qty}`
        );
      }

      // Calculate item total
      const itemTotal = product.price * qty;

      calculatedTotal += itemTotal;

      // Add item to order
      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: qty,
        price: product.price,
        total: itemTotal,
      });
    }

    // Make sure order has items
    if (orderItems.length === 0) {
      return sendResponse(
        res,
        400,
        false,
        "Cart is empty or items are invalid"
      );
    }

    // ======================================
    // CREATE ORDER
    // userId identifies who placed the order
    // ======================================
    const newOrder = new Order({
      userId: user._id,
      items: orderItems,
      totalAmount: calculatedTotal,
      status: "confirmed",
      shippingAddress,
    });

    // Save order
    await newOrder.save();

    // Reduce product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    // Clear user's cart
    await Cart.deleteMany({ userId });

    return sendResponse(
      res,
      201,
      true,
      "Order created successfully",
      newOrder
    );

  } catch (error) {
    console.error("Create order error:", error);

    return sendResponse(
      res,
      500,
      false,
      error.message
    );
  }
};

// ======================================
// 2. GET USER ORDERS
// GET /api/order/user/:userId
// ======================================
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check user exists
    const user = await User.findById(userId);

    if (!user) {
      return sendResponse(
        res,
        404,
        false,
        "User not found"
      );
    }

    // Get only this user's orders
    const orders = await Order.find({
      userId: userId
    }).sort({
      createdAt: -1
    });

    return sendResponse(
      res,
      200,
      true,
      "User orders retrieved successfully",
      orders
    );

  } catch (error) {
    console.error("Get user orders error:", error);

    return sendResponse(
      res,
      500,
      false,
      error.message
    );
  }
};

// ======================================
// 3. GET ADMIN ORDERS
// GET /api/order/admin
// ======================================
export const getAdminOrders = async (req, res) => {
  try {
    // Find all users whose role is admin
    const adminUsers = await User.find({
      role: "admin"
    }).select("_id");

    const adminIds = adminUsers.map(
      (admin) => admin._id
    );

    // Get only orders placed by admins
    const orders = await Order.find({
      userId: {
        $in: adminIds
      }
    }).sort({
      createdAt: -1
    });

    return sendResponse(
      res,
      200,
      true,
      "Admin orders retrieved successfully",
      orders
    );

  } catch (error) {
    console.error("Get admin orders error:", error);

    return sendResponse(
      res,
      500,
      false,
      error.message
    );
  }
};

// ======================================
// 4. GET ORDER BY ID
// GET /api/order/:id
// ======================================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendResponse(
        res,
        404,
        false,
        "Order not found"
      );
    }

    return sendResponse(
      res,
      200,
      true,
      "Order fetched successfully",
      order
    );

  } catch (error) {
    return sendResponse(
      res,
      500,
      false,
      "Invalid order ID or server error"
    );
  }
};

// ======================================
// 5. UPDATE ORDER STATUS
// PUT /api/order/:id/status
// ======================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return sendResponse(
        res,
        400,
        false,
        `Invalid status. Allowed statuses: ${allowedStatuses.join(", ")}`
      );
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendResponse(
        res,
        404,
        false,
        "Order not found"
      );
    }

    if (order.status === "cancelled") {
      return sendResponse(
        res,
        400,
        false,
        "Cannot update the status of a cancelled order"
      );
    }

    order.status = status;

    await order.save();

    return sendResponse(
      res,
      200,
      true,
      `Order status updated to '${status}'`,
      order
    );

  } catch (error) {
    return sendResponse(
      res,
      500,
      false,
      error.message
    );
  }
};

// ======================================
// 6. CANCEL ORDER
// PUT /api/order/:id/cancel
// ======================================
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendResponse(
        res,
        404,
        false,
        "Order not found"
      );
    }

    if (
      order.status !== "pending" &&
      order.status !== "confirmed"
    ) {
      return sendResponse(
        res,
        400,
        false,
        `Order cannot be cancelled because its current status is '${order.status}'`
      );
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            stock: item.quantity,
          },
        }
      );
    }

    order.status = "cancelled";

    await order.save();

    return sendResponse(
      res,
      200,
      true,
      "Order cancelled successfully and stock restored",
      order
    );

  } catch (error) {
    return sendResponse(
      res,
      500,
      false,
      error.message
    );
  }
};

// ======================================
// 7. DELETE ORDER
// DELETE /api/order/:id
// ======================================
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendResponse(
        res,
        404,
        false,
        "Order not found"
      );
    }

    if (
      order.status !== "cancelled" &&
      order.status !== "pending"
    ) {
      return sendResponse(
        res,
        400,
        false,
        "Active or completed orders cannot be deleted"
      );
    }

    await Order.findByIdAndDelete(req.params.id);

    return sendResponse(
      res,
      200,
      true,
      "Order deleted successfully"
    );

  } catch (error) {
    return sendResponse(
      res,
      500,
      false,
      error.message
    );
  }
};