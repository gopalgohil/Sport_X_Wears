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

  // Non-negative number validation
  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    throw new ApiError(400, 'Product price must be greater than 0 and cannot be negative');
  }

  const numDiscount = discountPrice !== undefined && discountPrice !== '' ? Number(discountPrice) : 0;
  if (isNaN(numDiscount) || numDiscount < 0) {
    throw new ApiError(400, 'Discount price cannot be negative');
  }
  if (numDiscount > numPrice) {
    throw new ApiError(400, 'Discount price cannot be higher than regular price');
  }

  const numStock = stock !== undefined && stock !== '' ? Number(stock) : 0;
  if (isNaN(numStock) || numStock < 0) {
    throw new ApiError(400, 'Stock quantity cannot be negative. Must be 0 or more');
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
  }
  const rawImages = req.body.images || req.body.imageUrls;
  if (rawImages) {
    let bodyImages = [];
    if (typeof rawImages === 'string') {
      try {
        const parsed = JSON.parse(rawImages);
        bodyImages = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        bodyImages = rawImages.split(',').map((s) => s.trim()).filter(Boolean);
      }
    } else if (Array.isArray(rawImages)) {
      bodyImages = rawImages;
    }
    imageUrls = [...imageUrls, ...bodyImages];
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
    includeInactive,
  } = req.query;

  const queryFilter = includeInactive === 'true' ? {} : { isActive: true };

  // Category filtering (supports name, slug, ObjectId, or dynamic admin-created categories)
  if (category && category !== 'ALL GEAR' && category !== 'ALL PRODUCTS') {
    const trimmedCat = category.trim();

    if (/^[0-9a-fA-F]{24}$/.test(trimmedCat)) {
      queryFilter.category = trimmedCat;
    } else {
      const slugified = trimmedCat
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const escapedCat = trimmedCat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Support singular and plural variations (e.g. "Sports Cap" vs "Sports Caps", "Track Pant" vs "Track Pants")
      const rootCat = trimmedCat.toLowerCase().replace(/s$/, '');
      const escapedRoot = rootCat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const matchingCategories = await Category.find({
        $or: [
          { slug: trimmedCat.toLowerCase() },
          { slug: slugified },
          { slug: { $regex: escapedRoot, $options: 'i' } },
          { name: { $regex: `^${escapedCat}$`, $options: 'i' } },
          { name: { $regex: escapedRoot, $options: 'i' } },
        ],
      }).select('_id').lean();

      if (matchingCategories.length > 0) {
        const catIds = matchingCategories.map((c) => c._id);
        queryFilter.category = catIds.length === 1 ? catIds[0] : { $in: catIds };
      } else {
        // Fallback: check if product title or description contains the category term
        queryFilter.$or = [
          { title: { $regex: escapedCat, $options: 'i' } },
          { slug: { $regex: slugified, $options: 'i' } },
          { description: { $regex: escapedCat, $options: 'i' } },
        ];
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

  // Search keyword filtering (matches title, description, and dynamically resolves categories like "trac", "cap", etc.)
  if (search && search.trim()) {
    const rawSearch = search.trim();
    const cleanSearch = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const lower = rawSearch.toLowerCase();
    const words = rawSearch
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    // Dynamic category resolution for search query
    const catConditions = [
      { name: { $regex: cleanSearch, $options: 'i' } },
      { slug: { $regex: cleanSearch, $options: 'i' } },
      { description: { $regex: cleanSearch, $options: 'i' } },
      ...words.map((w) => ({ name: { $regex: w, $options: 'i' } })),
      ...words.map((w) => ({ slug: { $regex: w, $options: 'i' } })),
    ];

    // Slang and root variations expansion
    if (lower.includes('trac') || lower.includes('pant') || lower.includes('jogger')) {
      catConditions.push({ name: { $regex: 'pant', $options: 'i' } });
      catConditions.push({ slug: { $regex: 'pant', $options: 'i' } });
    }
    if (lower.includes('cap') || lower.includes('hat')) {
      catConditions.push({ name: { $regex: 'cap', $options: 'i' } });
      catConditions.push({ slug: { $regex: 'cap', $options: 'i' } });
    }
    if (lower.includes('tshirt') || lower.includes('t-shirt') || lower.includes('tee') || lower.includes('shirt')) {
      catConditions.push({ name: { $regex: 'shirt', $options: 'i' } });
      catConditions.push({ slug: { $regex: 'shirt', $options: 'i' } });
    }

    const matchedCats = await Category.find({ $or: catConditions })
      .select('_id')
      .lean();
    const matchedCatIds = matchedCats.map((c) => c._id);

    const searchProductConditions = [
      { title: { $regex: cleanSearch, $options: 'i' } },
      { slug: { $regex: cleanSearch, $options: 'i' } },
      { description: { $regex: cleanSearch, $options: 'i' } },
      ...words.map((w) => ({ title: { $regex: w, $options: 'i' } })),
      ...words.map((w) => ({ description: { $regex: w, $options: 'i' } })),
    ];

    if (matchedCatIds.length > 0) {
      searchProductConditions.push({ category: { $in: matchedCatIds } });
    }

    // Merge search conditions with existing filter without wiping out category filters
    if (queryFilter.$or) {
      queryFilter.$and = [{ $or: queryFilter.$or }, { $or: searchProductConditions }];
      delete queryFilter.$or;
    } else {
      queryFilter.$or = searchProductConditions;
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

  // Validate non-negative numbers on update
  if (updates.price !== undefined) {
    const p = Number(updates.price);
    if (isNaN(p) || p <= 0) {
      throw new ApiError(400, 'Product price must be greater than 0 and cannot be negative');
    }
    updates.price = p;
  }

  if (updates.discountPrice !== undefined && updates.discountPrice !== '') {
    const dp = Number(updates.discountPrice);
    if (isNaN(dp) || dp < 0) {
      throw new ApiError(400, 'Discount price cannot be negative');
    }
    const currentPrice = updates.price !== undefined ? updates.price : product.price;
    if (dp > currentPrice) {
      throw new ApiError(400, 'Discount price cannot be higher than regular price');
    }
    updates.discountPrice = dp;
  }

  if (updates.stock !== undefined && updates.stock !== '') {
    const s = Number(updates.stock);
    if (isNaN(s) || s < 0) {
      throw new ApiError(400, 'Stock quantity cannot be negative. Must be 0 or more');
    }
    updates.stock = s;
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
  } else if (updates.images) {
    if (typeof updates.images === 'string') {
      try {
        const parsed = JSON.parse(updates.images);
        updates.images = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        updates.images = updates.images.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
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
