import express from "express";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";
const router = express.Router();

// Task 1: Create Category
router.post('/create', createCategory);

// Task 2: Category List
router.get('/list', getCategories);

// Task 3: Category By ID
router.get('/:id', getCategoryById);

// Task 4: Update Category
router.put('/:id', updateCategory);

// Task 5: Delete Category
router.delete('/:id', deleteCategory);

export default router;