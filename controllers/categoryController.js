import Category from "../models/category.js";

// Task 1: Create Category - POST /category/create
export const createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    // Validation for mandatory fields
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is mandatory.' });
    }

    // Check for duplicate category name
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category name should not be duplicated.' });
    }

    // Validate status values
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status should be active or inactive.' });
    }

    const category = new Category({ name, description, status });
    await category.save();

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Task 2: Category List - GET /category/list (supports optional ?status=active)
export const getCategories = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const categories = await Category.find(filter);
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Task 3: Category By ID - GET /category/:id
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid Category ID format.' });
  }
};

// Task 4: Update Category - PUT /category/:id
export const updateCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status should be active or inactive.' });
    }

    // Prevent name duplication on updates
    if (name) {
      const existingCategory = await Category.findOne({ name, _id: { $ne: req.params.id } });
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Category name already in use.' });
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, status },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Task 5: Delete Category - DELETE /category/:id
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};