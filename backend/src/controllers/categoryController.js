import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import slugify from '../utils/slugify.js';

/**
 * @desc    Create a new sport category
 * @route   POST /api/v1/categories
 * @access  Private/Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Category name is required');
  }

  // Generate unique slug
  let slug = slugify(name);
  const existingCategory = await Category.findOne({ slug }).lean();
  if (existingCategory) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  // Banner image from multer upload or direct URL payload
  const bannerImage = req.file?.path || req.body.bannerImage || null;

  const category = await Category.create({
    name: name.trim(),
    slug,
    description: description ? description.trim() : '',
    bannerImage,
    isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

/**
 * @desc    Get all active categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.query.all === 'true';
  const filter = includeInactive ? {} : { isActive: true };

  const categories = await Category.find(filter)
    .sort({ name: 1 })
    .lean();

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

/**
 * @desc    Get category by ID or slug
 * @route   GET /api/v1/categories/:idOrSlug
 * @access  Public
 */
export const getCategoryByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
  const category = await Category.findOne(query).lean();

  if (!category) {
    throw new ApiError(404, `Category '${idOrSlug}' not found`);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

/**
 * @desc    Update a category
 * @route   PUT /api/v1/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (name && name.trim()) {
    category.name = name.trim();
    category.slug = slugify(name);
  }

  if (description !== undefined) {
    category.description = description.trim();
  }

  if (isActive !== undefined) {
    category.isActive = Boolean(isActive);
  }

  if (req.file?.path) {
    category.bannerImage = req.file.path;
  } else if (req.body.bannerImage !== undefined) {
    category.bannerImage = req.body.bannerImage;
  }

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

/**
 * @desc    Delete a category (Soft delete toggle or hard delete)
 * @route   DELETE /api/v1/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { permanent } = req.query;

  if (permanent === 'true') {
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      throw new ApiError(404, 'Category not found');
    }
    return res.status(200).json({
      success: true,
      message: 'Category permanently removed',
    });
  }

  // Soft delete by default
  const category = await Category.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).lean();

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.status(200).json({
    success: true,
    message: 'Category deactivated successfully',
    data: category,
  });
});
