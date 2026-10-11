import { Product, Category } from '../types';

export const FALLBACK_CATEGORIES: Category[] = [
  {
    _id: '6ac74f2c9e6cb9a296c78058',
    name: 'Sports T-Shirts',
    slug: 'sports-t-shirts',
    description: 'High-performance athletic moisture-wicking and seamless t-shirts engineered for peak endurance.',
    isActive: true,
  },
  {
    _id: '6ac74f2c9e6cb9a296c78059',
    name: 'Track Pants',
    slug: 'track-pants',
    description: 'Ergonomic tapered jogger track pants with water-repellent flex weave and zippered storage.',
    isActive: true,
  },
  {
    _id: '6ac74f2c9e6cb9a296c7805a',
    name: 'Sports Caps',
    slug: 'sports-caps',
    description: 'Laser-perforated breathable headwear with sweat-absorbent athletic bands.',
    isActive: true,
  },
];

export const FALLBACK_PRODUCTS: Product[] = [
  {
    _id: '6acb103f3f85bf49e903a5d4',
    title: 'Nike T-shirt',
    slug: 'nike-t-shirt',
    category: FALLBACK_CATEGORIES[0],
    description: 'Premium quality athletic training t-shirt built with moisture-wicking fabric for maximum comfort.',
    price: 1000,
    discountPrice: 493,
    sizes: ['M', 'L', 'XL'],
    images: [
      'https://res.cloudinary.com/k55mdc5l/image/upload/v1791692862/sportxwear/products/1791692861836_sport_x_wear.webp',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 7,
    isActive: true,
  },
  {
    _id: '6ac74f2c9e6cb9a296c7805b',
    title: 'Pro-Vent Mesh Seamless Tee',
    slug: 'pro-vent-mesh-seamless-tee',
    category: FALLBACK_CATEGORIES[0],
    description: 'Engineered with 4-way micro-cooling mesh and zero-abrasion seam technology for high-exertion workouts.',
    price: 1899,
    discountPrice: 1499,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 22,
    isActive: true,
  },
  {
    _id: '6ac74f2c9e6cb9a296c7805c',
    title: 'Apex Aerodynamic Compression Top',
    slug: 'apex-aerodynamic-compression-top',
    category: FALLBACK_CATEGORIES[0],
    description: 'Graduated compression panels support key muscle tendons, reducing micro-vibrations during intense training.',
    price: 2299,
    discountPrice: 1799,
    sizes: ['M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 18,
    isActive: true,
  },
  {
    _id: '6ac74f2c9e6cb9a296c7805d',
    title: 'Kinetic Swift-Dry Training Shirt',
    slug: 'kinetic-swift-dry-training-shirt',
    category: FALLBACK_CATEGORIES[0],
    description: 'Ultralight polymer construction expels sweat quickly, keeping you cool under extreme cardio sessions.',
    price: 1299,
    discountPrice: 0,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 32,
    isActive: true,
  },
  {
    _id: '6ac74f2c9e6cb9a296c7805e',
    title: 'Velocity Tapered Track Pant 2.0',
    slug: 'velocity-tapered-track-pant-2-0',
    category: FALLBACK_CATEGORIES[1],
    description: 'Ergonomic tapered track pants with waterproof zip pockets and ankle cuffs for optimal comfort.',
    price: 2999,
    discountPrice: 2499,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 9,
    isActive: true,
  },
  {
    _id: '6ac74f2c9e6cb9a296c7805f',
    title: 'HydroShield Storm Flex Pants',
    slug: 'hydroshield-storm-flex-pants',
    category: FALLBACK_CATEGORIES[1],
    description: 'Water-repellent flex weave repels moisture and rain while preserving 4-way mechanical stretch.',
    price: 3499,
    discountPrice: 2899,
    sizes: ['M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 12,
    isActive: true,
  },
  {
    _id: '6ac74f2c9e6cb9a296c78060',
    title: 'AeroVent Laser-Perforated Cap',
    slug: 'aerovent-laser-perforated-cap',
    category: FALLBACK_CATEGORIES[2],
    description: 'Laser-cut ventilation promotes airflow across the head with a curved anti-glare brim for sunny days.',
    price: 1199,
    discountPrice: 899,
    sizes: ['S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 40,
    isActive: true,
  },
  {
    _id: '6ac74f2c9e6cb9a296c78061',
    title: 'Shadow Stealth Running Cap',
    slug: 'shadow-stealth-running-cap',
    category: FALLBACK_CATEGORIES[2],
    description: 'Featherlight 52g cap with reflective accents for high visibility during morning and evening runs.',
    price: 999,
    discountPrice: 799,
    sizes: ['M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 22,
    isActive: true,
  },
  {
    _id: '6ac74f2c9e6cb9a296c78062',
    title: 'Pulse Elite Compression Long Sleeve',
    slug: 'pulse-elite-compression-long-sleeve',
    category: FALLBACK_CATEGORIES[0],
    description: 'Full-arm graduated compression weave with thermal balance zones to maintain core body temperature.',
    price: 2499,
    discountPrice: 2099,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 16,
    isActive: true,
  },
];

const STORAGE_KEY_PRODUCTS = 'sportxwear_cached_products_v2';
const STORAGE_KEY_CATEGORIES = 'sportxwear_cached_categories_v2';

export function getCachedProducts(): Product[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return FALLBACK_PRODUCTS;
}

export function saveCachedProducts(products: Product[]): void {
  if (typeof window !== 'undefined' && Array.isArray(products) && products.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch {
      // ignore
    }
  }
}

export function getCachedCategories(): Category[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return FALLBACK_CATEGORIES;
}

export function saveCachedCategories(categories: Category[]): void {
  if (typeof window !== 'undefined' && Array.isArray(categories) && categories.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }
}
