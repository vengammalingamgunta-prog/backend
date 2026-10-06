
import Product from "../models/Product.js";

// ==========================================
// CREATE PRODUCT
// POST /api/product/create
// ==========================================
export const createProduct = async (req, res) => {
  try {
    console.log("CREATE PRODUCT BODY:", req.body);

    const {
      name,
      description,
      price,
      stock,
      status,
      category,
      image,
    } = req.body;

    // ==============================
    // REQUIRED FIELD VALIDATION
    // ==============================

    if (
      !name ||
      !description ||
      price === undefined ||
      stock === undefined ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, price, stock and status are required",
      });
    }

    // Category validation
    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // Image validation
    if (!image || !image.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    // ==============================
    // PRICE VALIDATION
    // ==============================

    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // ==============================
    // STOCK VALIDATION
    // ==============================

    if (Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    // ==============================
    // STATUS VALIDATION
    // ==============================

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    // ==============================
    // CREATE PRODUCT
    // ==============================

    const product = await Product.create({
      name: name.trim(),
      description,
      price: Number(price),
      stock: Number(stock),
      status,
      category: category.trim(),
      image: image.trim(),
    });

    // ==============================
    // SUCCESS RESPONSE
    // ==============================

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET ALL PRODUCTS
// GET /api/product/list
// ==========================================
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET PRODUCT BY ID
// GET /api/product/:id
// ==========================================
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product by ID error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// UPDATE PRODUCT
// PUT /api/product/:id
// ==========================================
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      status,
      category,
      image,
    } = req.body;

    // ==============================
    // PRICE VALIDATION
    // ==============================

    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // ==============================
    // STOCK VALIDATION
    // ==============================

    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    // ==============================
    // STATUS VALIDATION
    // ==============================

    if (
      status !== undefined &&
      !["active", "inactive"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    // ==============================
    // CATEGORY VALIDATION
    // ==============================

    if (
      category !== undefined &&
      !String(category).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Category cannot be empty",
      });
    }

    // ==============================
    // IMAGE VALIDATION
    // ==============================

    if (
      image !== undefined &&
      !String(image).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Product image cannot be empty",
      });
    }

    // ==============================
    // UPDATE DATA
    // ==============================

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (price !== undefined) {
      updateData.price = Number(price);
    }

    if (stock !== undefined) {
      updateData.stock = Number(stock);
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (category !== undefined) {
      updateData.category = category.trim();
    }

    if (image !== undefined) {
      updateData.image = image.trim();
    }

    // ==============================
    // FIND AND UPDATE
    // ==============================

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// DELETE PRODUCT
// DELETE /api/product/:id
// ==========================================
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

