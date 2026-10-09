import mongoose from 'mongoose';

/**
 * Category Schema
 * Represents dynamic sport categories (e.g., Running, Training, Basketball).
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [60, 'Category name cannot exceed 60 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    bannerImage: {
      type: String,
      default: null,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for ultra-fast query execution
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1, createdAt: -1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
