'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Save,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Product, Category, AthleticSize } from '@/types';
import { getCategories, createProductAdmin, updateProductAdmin } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

const AVAILABLE_SIZES: AthleticSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const { token } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form states
  const [title, setTitle] = useState(initialData?.title || '');
  const [categoryId, setCategoryId] = useState<string>(
    typeof initialData?.category === 'object'
      ? (initialData.category as Category)._id
      : (initialData?.category as string) || ''
  );
  const [price, setPrice] = useState<string>(initialData?.price ? String(initialData.price) : '');
  const [discountPrice, setDiscountPrice] = useState<string>(
    initialData?.discountPrice ? String(initialData.discountPrice) : ''
  );
  const [stock, setStock] = useState<string>(initialData?.stock !== undefined ? String(initialData.stock) : '20');
  const [description, setDescription] = useState(initialData?.description || '');
  const [sizes, setSizes] = useState<AthleticSize[]>(initialData?.sizes || ['M', 'L', 'XL']);
  const [isActive, setIsActive] = useState<boolean>(initialData?.isActive !== undefined ? initialData.isActive : true);

  // Image states: existing URLs + new files uploaded
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
          if (!categoryId && res.data.length > 0) {
            setCategoryId(res.data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCats();
  }, []);

  // Handle size toggle
  const toggleSize = (size: AthleticSize) => {
    if (sizes.includes(size)) {
      if (sizes.length === 1) {
        setError('At least one size must be selected.');
        return;
      }
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
    setError(null);
  };

  // Handle local file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const totalImages = existingImages.length + newImageFiles.length + files.length;
      if (totalImages > 5) {
        setError('Maximum 5 images allowed per product.');
        return;
      }

      setNewImageFiles((prev) => [...prev, ...files]);

      const previews = files.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...previews]);
      setError(null);
    }
  };

  // Remove existing image
  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // Remove pending file upload
  const removeNewFile = (index: number) => {
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  // Add custom URL image
  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    if (existingImages.length + newImageFiles.length >= 5) {
      setError('Maximum 5 images allowed per product.');
      return;
    }
    setExistingImages([...existingImages, customImageUrl.trim()]);
    setCustomImageUrl('');
    setError(null);
  };

  // Prevent typing negative signs, exponential notation, or plus signs
  const blockNegativeKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  };

  // Sanitizers to eliminate negative numbers or invalid symbols
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9.]/g, '');
    setPrice(clean);
  };

  const handleDiscountPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9.]/g, '');
    setDiscountPrice(clean);
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9]/g, '');
    setStock(clean);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!title.trim()) {
      setError('Please provide a product title');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    // Strict non-negative numeric validations
    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      setError('Regular price must be greater than 0. Negative numbers are not allowed.');
      return;
    }

    const numDiscount = discountPrice !== '' ? Number(discountPrice) : 0;
    if (discountPrice !== '' && (isNaN(numDiscount) || numDiscount < 0)) {
      setError('Discount price cannot be negative. Must be 0 or more.');
      return;
    }
    if (discountPrice !== '' && numDiscount > numPrice) {
      setError('Discount price cannot be higher than regular price.');
      return;
    }

    const numStock = Number(stock);
    if (stock === '' || isNaN(numStock) || numStock < 0) {
      setError('Stock units cannot be negative. Must be 0 or more.');
      return;
    }

    if (sizes.length === 0) {
      setError('At least one size variant must be selected');
      return;
    }
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      setError('Please provide at least one product image (upload or URL)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use FormData if new image files are uploaded, otherwise send JSON
      if (newImageFiles.length > 0) {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('category', categoryId);
        formData.append('price', price);
        if (discountPrice) formData.append('discountPrice', discountPrice);
        formData.append('stock', stock || '0');
        formData.append('description', description.trim());
        formData.append('sizes', JSON.stringify(sizes));
        formData.append('isActive', String(isActive));

        // Existing image URLs
        if (existingImages.length > 0) {
          formData.append('imageUrls', JSON.stringify(existingImages));
        }

        // Attached image binary files
        newImageFiles.forEach((file) => {
          formData.append('images', file);
        });

        if (isEdit && initialData?._id) {
          await updateProductAdmin(initialData._id, formData, token);
        } else {
          await createProductAdmin(formData, token);
        }
      } else {
        // Pure JSON payload
        const payload = {
          title: title.trim(),
          category: categoryId,
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : 0,
          stock: Number(stock) || 0,
          description: description.trim(),
          sizes,
          images: existingImages,
          isActive,
        };

        if (isEdit && initialData?._id) {
          await updateProductAdmin(initialData._id, payload, token);
        } else {
          await createProductAdmin(payload, token);
        }
      }

      setSuccessMessage(isEdit ? 'Product updated successfully!' : 'Product created successfully!');
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate discount percentage preview
  const numPrice = Number(price) || 0;
  const numDiscount = Number(discountPrice) || 0;
  const discountPercent =
    numPrice > 0 && numDiscount > 0 && numDiscount < numPrice
      ? Math.round(((numPrice - numDiscount) / numPrice) * 100)
      : null;

  const previewImage =
    newImagePreviews[0] ||
    existingImages[0] ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>

        <span className="text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
          {isEdit ? 'Edit Mode' : 'New Product Creator'}
        </span>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 flex items-start gap-3">
          <Check className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Main Grid: Form (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Inputs (2 Columns) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Card: Basic Information */}
          <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              General Information
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AeroVent Swift-Dry Compression Tee"
                required
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loadingCategories}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm capitalize"
                >
                  {loadingCategories ? (
                    <option>Loading categories...</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Stock Units *
                  </label>
                  <span className="text-[10px] text-neutral-500 font-medium">Min: 0</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onKeyDown={blockNegativeKeys}
                  onChange={handleStockChange}
                  placeholder="25"
                  required
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-semibold"
                />
                <p className="text-[11px] text-neutral-500 mt-1">Must be 0 or positive integer</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High performance athletic gear description..."
                required
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm resize-none"
              />
            </div>
          </div>

          {/* Card: Pricing & Sizes */}
          <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Pricing & Athletic Sizing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Regular Price (₹) *
                  </label>
                  <span className="text-[10px] text-emerald-400 font-medium">&gt; 0 Only</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-neutral-500 font-semibold">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={price}
                    onKeyDown={blockNegativeKeys}
                    onChange={handlePriceChange}
                    placeholder="1899"
                    required
                    className="w-full pl-8 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-semibold"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">Cannot be 0 or negative</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Discount Price (₹) (Optional)
                  </label>
                  <span className="text-[10px] text-neutral-500 font-medium">Min: 0</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-neutral-500 font-semibold">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={discountPrice}
                    onKeyDown={blockNegativeKeys}
                    onChange={handleDiscountPriceChange}
                    placeholder="1499"
                    className="w-full pl-8 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-semibold"
                  />
                </div>
                {discountPercent !== null ? (
                  <p className="mt-1.5 text-xs text-emerald-400 font-medium">
                    🔥 {discountPercent}% OFF customer badge will be displayed
                  </p>
                ) : (
                  <p className="text-[11px] text-neutral-500 mt-1">Leave empty or 0 if no discount</p>
                )}
              </div>
            </div>

            {/* Athletic Sizes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Available Athletic Sizes *
              </label>
              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_SIZES.map((size) => {
                  const selected = sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        selected
                          ? 'bg-red-600 text-white shadow-md shadow-red-900/30 border border-red-500 scale-105'
                          : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card: Images & Media */}
          <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Product Imagery (Up to 5)
              </h2>
              <span className="text-xs text-neutral-500">
                {existingImages.length + newImageFiles.length}/5 Images
              </span>
            </div>

            {/* Upload Area */}
            <label className="border-2 border-dashed border-neutral-800 hover:border-red-600/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-neutral-950/50 group">
              <Upload className="w-8 h-8 text-neutral-500 group-hover:text-red-500 transition-colors mb-2" />
              <p className="text-sm font-medium text-neutral-300">
                Click to browse or drag & drop high-res athletic images
              </p>
              <p className="text-xs text-neutral-500 mt-1">PNG, JPG, WebP up to 5MB</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Add Image URL fallback */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Or Paste Image Direct URL
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Thumbnail Preview Grid */}
            {(existingImages.length > 0 || newImagePreviews.length > 0) && (
              <div className="pt-2">
                <p className="text-xs text-neutral-400 mb-3 font-semibold">Active Images:</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {existingImages.map((url, i) => (
                    <div
                      key={`existing-${i}`}
                      className="relative aspect-square rounded-xl overflow-hidden border border-neutral-800 group"
                    >
                      <img
                        src={url}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-90 transition-opacity"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {newImagePreviews.map((preview, i) => (
                    <div
                      key={`new-${i}`}
                      className="relative aspect-square rounded-xl overflow-hidden border border-red-500/50 group"
                    >
                      <img
                        src={preview}
                        alt="New upload preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 left-1 bg-red-600 text-[9px] px-1.5 py-0.5 rounded text-white font-bold uppercase">
                        New
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-90 transition-opacity"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card: Active Status Toggle */}
          <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-sm">Product Status</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isActive
                  ? 'Product is visible and purchasable in the customer storefront.'
                  : 'Product is hidden from customer browsing (Draft mode).'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? 'bg-red-600' : 'bg-neutral-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Form Submit Button */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : isEdit ? 'Update Product' : 'Publish Product'}</span>
            </button>

            <Link
              href="/admin/products"
              className="px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold text-sm border border-neutral-800 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Live Card Preview (Right 1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>Storefront Live Preview</span>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4">
            {/* Card Image */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
              <img
                src={previewImage}
                alt="Live preview"
                className="w-full h-full object-cover"
              />
              {discountPercent !== null && (
                <span className="absolute top-2.5 left-2.5 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-md tracking-wider">
                  {discountPercent}% OFF
                </span>
              )}
              <span
                className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    : 'bg-neutral-900/90 text-neutral-400 border border-neutral-700'
                }`}
              >
                {isActive ? 'LIVE' : 'DRAFT'}
              </span>
            </div>

            {/* Card Details */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                {categories.find((c) => c._id === categoryId)?.name || 'Sportswear'}
              </p>
              <h3 className="font-bold font-headline text-lg text-white leading-snug truncate">
                {title || 'Product Title Preview'}
              </h3>

              {/* Price Row */}
              <div className="flex items-baseline gap-2 pt-1">
                {discountPrice ? (
                  <>
                    <span className="text-xl font-black text-white font-headline">
                      ₹{discountPrice}
                    </span>
                    <span className="text-sm line-through text-neutral-500">
                      ₹{price || '0'}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-black text-white font-headline">
                    ₹{price || '0'}
                  </span>
                )}
              </div>

              {/* Sizes preview */}
              <div className="flex items-center gap-1.5 pt-2">
                <span className="text-[11px] text-neutral-500">Sizes:</span>
                <div className="flex gap-1">
                  {sizes.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-xs text-neutral-500 flex items-center justify-between border-t border-neutral-800/80">
                <span>Stock: {stock || 0} units</span>
                <span className={Number(stock) < 10 ? 'text-amber-400' : 'text-emerald-400'}>
                  {Number(stock) < 10 ? 'Low Stock' : 'In Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
