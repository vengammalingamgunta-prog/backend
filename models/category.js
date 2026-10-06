import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['active', 'inactive'],
        message: 'Status must be either active or inactive'
      },
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// MUST USE 'export default' FOR ESM IMPORTS TO WORK
const Category = mongoose.model('Category', categorySchema);
export default Category;