/**
 * Formats numeric price into Indian Rupees (INR - ₹)
 */
export function formatPrice(amount: number = 0): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates percentage savings between standard and discount price
 */
export function getDiscountPercentage(originalPrice: number, discountPrice?: number): number {
  if (!discountPrice || discountPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

/**
 * Combines conditional class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

import { Product, Category } from '../types';

export interface FilterProductsOptions {
  category?: string;
  size?: string;
  sort?: string;
  search?: string;
}

/**
 * High-performance instant client-side product filtering for 0ms lag-free filtering
 */
export function filterProducts(
  catalog: Product[],
  options: FilterProductsOptions = {},
  categories?: Category[]
): Product[] {
  if (!Array.isArray(catalog)) return [];
  const { category, size, sort, search } = options;
  let result = [...catalog];

  // 1. Category Filter
  if (category && category !== 'ALL PRODUCTS' && category !== 'ALL GEAR') {
    const catLower = category.toLowerCase().trim();
    const catRoot = catLower.replace(/s$/, ''); // e.g. "sport cap", "track pant"
    const slugified = catLower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Map category IDs that correspond to this category
    const matchedCategoryIds = new Set<string>();
    if (categories && Array.isArray(categories)) {
      categories.forEach((c) => {
        const cName = c.name?.toLowerCase().trim() || '';
        const cSlug = c.slug?.toLowerCase().trim() || '';
        if (
          cName === catLower ||
          cSlug === slugified ||
          cName.includes(catRoot) ||
          cSlug.includes(catRoot)
        ) {
          if (c._id) matchedCategoryIds.add(String(c._id));
        }
      });
    }

    result = result.filter((p) => {
      const catObj = typeof p.category === 'object' && p.category !== null ? p.category : null;
      const catString = typeof p.category === 'string' ? p.category.trim() : '';

      const catId = catObj?._id ? String(catObj._id) : catString;
      const catName = catObj?.name?.toLowerCase().trim() || '';
      const catSlug = catObj?.slug?.toLowerCase().trim() || '';
      const titleLower = (p.title || '').toLowerCase();
      const descLower = (p.description || '').toLowerCase();

      // Matched via category ID lookup from categories array
      if (catId && matchedCategoryIds.has(catId)) return true;

      // Check exact category name or slug
      if (catName === catLower || catSlug === slugified) return true;

      // Check category root substring
      if (catName.includes(catRoot) || catSlug.includes(catRoot)) return true;

      // If category string is name or slug directly
      if (catString) {
        const csLower = catString.toLowerCase();
        if (csLower === catLower || csLower === slugified || csLower.includes(catRoot)) return true;
      }

      // Semantic / Keyword shortcuts for known athletic gear
      if (catLower.includes('cap')) {
        if (titleLower.includes('cap') || catName.includes('cap') || descLower.includes('cap')) return true;
      }
      if ((catLower.includes('pant') || catLower.includes('track') || catLower.includes('jogger')) &&
          (titleLower.includes('pant') || titleLower.includes('track') || titleLower.includes('jogger') || catName.includes('pant'))) return true;
      if ((catLower.includes('shirt') || catLower.includes('tee') || catLower.includes('top')) &&
          (titleLower.includes('tee') || titleLower.includes('shirt') || titleLower.includes('top') || catName.includes('shirt'))) return true;

      return false;
    });
  }

  // 2. Size Variant Filter
  if (size && size !== 'ALL') {
    result = result.filter((p) => Array.isArray(p.sizes) && p.sizes.includes(size as any));
  }

  // 3. Search Keyword Filter
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    result = result.filter((p) => {
      const catObj = typeof p.category === 'object' && p.category !== null ? p.category : null;
      const catName = catObj?.name?.toLowerCase() || '';
      const titleLower = (p.title || '').toLowerCase();
      const descLower = (p.description || '').toLowerCase();

      const isTrackMatch = (q.includes('trac') || q.includes('pant') || q.includes('jogger')) &&
        (catName.includes('pant') || titleLower.includes('track') || titleLower.includes('pant') || titleLower.includes('jogger'));
      const isCapMatch = (q.includes('cap') || q.includes('hat')) &&
        (catName.includes('cap') || titleLower.includes('cap'));
      const isTeeMatch = (q.includes('tshirt') || q.includes('t-shirt') || q.includes('shirt') || q.includes('tee')) &&
        (catName.includes('shirt') || titleLower.includes('shirt') || titleLower.includes('tee'));

      return (
        titleLower.includes(q) ||
        descLower.includes(q) ||
        catName.includes(q) ||
        isTrackMatch ||
        isCapMatch ||
        isTeeMatch
      );
    });
  }

  // 4. Sort Options
  if (sort === 'price-low' || sort === 'price_asc') {
    result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === 'price-high' || sort === 'price_desc') {
    result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sort === 'newest') {
    result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  return result;
}
