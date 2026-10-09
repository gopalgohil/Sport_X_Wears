import Product from '../models/Product.js';
import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import slugify from '../utils/slugify.js';

/**
 * @desc    Create a new product with image uploads
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    category,
    price,
    discountPrice,
    sizes,
    stock,
    description,
    isActive,
  } = req.body;

  if (!title || !price || !category || !description) {
    throw new ApiError(400, 'Title, category, price, and description are required fields');
  }

  // Resolve category ID (supports either ObjectId or category slug)
  let categoryId = category;
  if (typeof category === 'string' && !/^[0-9a-fA-F]{24}$/.test(category)) {
    const categoryDoc = await Category.findOne({ slug: category }).lean();
    if (!categoryDoc) {
      throw new ApiError(404, `Category '${category}' not found`);
    }
    categoryId = categoryDoc._id;
  } else {
    const categoryExists = await Category.findById(categoryId).lean();
    if (!categoryExists) {
      throw new ApiError(404, 'Category referenced by ID does not exist');
    }
  }

  // Parse athletic sizes from multipart FormData or JSON
  let parsedSizes = sizes;
  if (typeof sizes === 'string') {
    try {
      parsedSizes = JSON.parse(sizes);
    } catch {
      parsedSizes = sizes.split(',').map((s) => s.trim().toUpperCase());
    }
  }

  if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
    parsedSizes = ['M']; // Safe default athletic size if omitted
  }

  // Extract images from Cloudinary multer upload or direct URLs
  let imageUrls = [];
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    imageUrls = req.files.map((file) => file.path);
  } else if (req.body.images) {
    imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
  }

  if (imageUrls.length === 0) {
    throw new ApiError(400, 'At least one product image is required');
  }

  // Unique slug generation
  let slug = slugify(title);
  const existingProduct = await Product.findOne({ slug }).lean();
  if (existingProduct) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const product = await Product.create({
    title: title.trim(),
    slug,
    category: categoryId,
    description: description.trim(),
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : 0,
    sizes: parsedSizes,
    images: imageUrls,
    stock: stock !== undefined ? Number(stock) : 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  const populatedProduct = await Product.findById(product._id)
    .populate('category', 'name slug')
    .lean();

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: populatedProduct,
  });
});

/**
 * @desc    Get paginated, filtered, and sorted products
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    size,
    minPrice,
    maxPrice,
    sort = 'newest',
    search,
    page = 1,
    limit = 12,
  } = req.query;

  const queryFilter = { isActive: true };

  // Category filtering (supports slug or ObjectId)
  if (category) {
    if (/^[0-9a-fA-F]{24}$/.test(category)) {
      queryFilter.category = category;
    } else {
      const categoryDoc = await Category.findOne({ slug: category }).lean();
      if (categoryDoc) {
        queryFilter.category = categoryDoc._id;
      } else {
        // Return empty result if category slug is not found
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          page: Number(page),
          totalPages: 0,
          data: [],
        });
      }
    }
  }

  // Size variant filtering
  if (size) {
    const sizeArray = size.split(',').map((s) => s.trim().toUpperCase());
    queryFilter.sizes = { $in: sizeArray };
  }

  // Price range filtering
  if (minPrice !== undefined || maxPrice !== undefined) {
    queryFilter.price = {};
    if (minPrice !== undefined && minPrice !== '') {
      queryFilter.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      queryFilter.price.$lte = Number(maxPrice);
    }
  }

  // Search keyword filtering
  if (search && search.trim()) {
    const rawSearch = search.trim();
    const cleanSearch = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const lower = rawSearch.toLowerCase();

    // Check if the query is a general category intent
    const isCategorySearch =
      lower === 'cap' ||
      lower === 'caps' ||
      lower === 'sports caps' ||
      lower === 'tshirt' ||
      lower === 't-shirt' ||
      lower === 't-shirts' ||
      lower === 't shirts' ||
      lower === 'sports t-shirts' ||
      lower === 'pant' ||
      lower === 'pants' ||
      lower === 'track pant' ||
      lower === 'track pants' ||
      lower === 'jogger' ||
      lower === 'joggers';

    if (isCategorySearch) {
      let catKeyword = 'Sports Caps';
      if (lower.includes('tshirt') || lower.includes('t-shirt') || lower.includes('t shirt') || lower.includes('tee')) {
        catKeyword = 'Sports T-Shirts';
      } else if (lower.includes('pant') || lower.includes('track') || lower.includes('jogger')) {
        catKeyword = 'Track Pants';
      }

      const matchingCategories = await Category.find({
        name: { $regex: catKeyword, $options: 'i' },
      }).select('_id').lean();
      const matchingCatIds = matchingCategories.map((c) => c._id);

      queryFilter.$or = [
        { title: { $regex: cleanSearch, $options: 'i' } },
        { description: { $regex: cleanSearch, $options: 'i' } },
        ...(matchingCatIds.length > 0 ? [{ category: { $in: matchingCatIds } }] : []),
      ];
    } else {
      // Specific keyword / product title search
      const words = rawSearch
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

      queryFilter.$or = [
        { title: { $regex: cleanSearch, $options: 'i' } },
        { description: { $regex: cleanSearch, $options: 'i' } },
        ...(words.length > 0 ? words.map((w) => ({ title: { $regex: w, $options: 'i' } })) : []),
      ];
    }
  }

  // High-performance sorting configurations
  let sortOption = { createdAt: -1 }; // Default newest
  if (sort === 'price_asc' || sort === 'price-low') {
    sortOption = { price: 1 };
  } else if (sort === 'price_desc' || sort === 'price-high') {
    sortOption = { price: -1 };
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Execute parallel count and indexed query
  const [total, products] = await Promise.all([
    Product.countDocuments(queryFilter),
    Product.find(queryFilter)
      .select('title slug category price discountPrice sizes images stock isActive createdAt')
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1,
    data: products,
  });
});

/**
 * @desc    Get single product by ID or slug for PDP
 * @route   GET /api/v1/products/:idOrSlug
 * @access  Public
 */
export const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  const product = await Product.findOne(query)
    .populate('category', 'name slug description bannerImage')
    .lean();

  if (!product) {
    throw new ApiError(404, `Product '${idOrSlug}' not found`);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

/**
 * @desc    Update product details
 * @route   PUT /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Update slug if title was modified
  if (updates.title && updates.title !== product.title) {
    updates.slug = slugify(updates.title);
  }

  // Parse sizes if provided as string
  if (updates.sizes && typeof updates.sizes === 'string') {
    try {
      updates.sizes = JSON.parse(updates.sizes);
    } catch {
      updates.sizes = updates.sizes.split(',').map((s) => s.trim().toUpperCase());
    }
  }

  // Append or replace images if new files were uploaded
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const newImages = req.files.map((file) => file.path);
    // If replaceImages flag is true, replace; otherwise append
    updates.images = req.body.replaceImages === 'true'
      ? newImages
      : [...product.images, ...newImages].slice(0, 5);
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })
    .populate('category', 'name slug')
    .lean();

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct,
  });
});

/**
 * @desc    Delete a product (soft delete toggle or hard remove)
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { permanent } = req.query;

  if (permanent === 'true') {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      throw new ApiError(404, 'Product not found');
    }
    return res.status(200).json({
      success: true,
      message: 'Product permanently removed',
    });
  }

  // Soft delete (deactivate)
  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).lean();

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({
    success: true,
    message: 'Product deactivated successfully',
    data: product,
  });
});
