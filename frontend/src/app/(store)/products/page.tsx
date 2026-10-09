'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, X, Search, RotateCcw } from 'lucide-react';
import { Product } from '../../../types';
import Navbar from '../../../components/common/Navbar';
import Footer from '../../../components/common/Footer';
import CartDrawer from '../../../components/cart/CartDrawer';
import ProductGrid from '../../../components/product/ProductGrid';
import ProductFilter from '../../../components/product/ProductFilter';
import { getProducts, getCategories } from '../../../lib/api';

const STITCH_PRODUCTS: Product[] = [
  {
    _id: 'prod-1',
    title: 'Pro-Vent Mesh Seamless Tee',
    slug: 'pro-vent-mesh-seamless-tee',
    category: 'Sports T-Shirts',
    description: 'Engineered with AeroVent™ 4-way micro-cooling mesh and zero-abrasion seam technology.',
    price: 1899,
    discountPrice: 1499,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 5,
    isActive: true,
    badge: 'SAVE 21%',
    tech: 'AEROVENT™',
  },
  {
    _id: 'prod-2',
    title: 'Apex Aerodynamic Compression Top',
    slug: 'apex-aerodynamic-compression-top',
    category: 'Sports T-Shirts',
    description: 'Targeted muscle compression with thermo-reactive heat dispersal channels.',
    price: 2299,
    discountPrice: 1799,
    sizes: ['M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 8,
    isActive: true,
    badge: 'SAVE 22%',
    tech: 'THERMOFLEX™',
  },
  {
    _id: 'prod-3',
    title: 'Kinetic Swift-Dry Training Shirt',
    slug: 'kinetic-swift-dry-training-shirt',
    category: 'Sports T-Shirts',
    description: 'Ultra-lightweight fabric engineered for multi-sport agility.',
    price: 1299,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 15,
    isActive: true,
    badge: 'NEW RELEASE',
    tech: 'SWIFT-DRY',
  },
  {
    _id: 'prod-4',
    title: 'Velocity Tapered Track Pant 2.0',
    slug: 'velocity-tapered-track-pant-2',
    category: 'Track Pants',
    description: 'Ergonomic tapered silhouette with water-repellent flex weave.',
    price: 2999,
    discountPrice: 2499,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 12,
    isActive: true,
    badge: 'SAVE 17%',
    tech: 'DURASHIELD™',
  },
  {
    _id: 'prod-5',
    title: 'StormShield Weather-Resistant Jogger',
    slug: 'stormshield-weather-resistant-jogger',
    category: 'Track Pants',
    description: 'Windproof micro-ripstop shell bonded to a brushed fleece thermal liner.',
    price: 2799,
    sizes: ['M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 10,
    isActive: true,
    badge: 'ALL-WEATHER',
    tech: 'STORMSHIELD™',
  },
  {
    _id: 'prod-6',
    title: 'AeroStrike Laser-Cut Performance Cap',
    slug: 'aerostrike-laser-cut-performance-cap',
    category: 'Sports Caps',
    description: 'Ultralight structured crown with 48 laser-cut heat vent ports.',
    price: 1299,
    discountPrice: 999,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 20,
    isActive: true,
    badge: 'SAVE 23%',
    tech: 'AEROVENT™',
  },
  {
    _id: 'prod-7',
    title: 'Stealth Hydro-Wick Trucker Cap',
    slug: 'stealth-hydro-wick-trucker-cap',
    category: 'Sports Caps',
    description: 'Breathable ballistic mesh back panels paired with water-resistant front crown.',
    price: 1099,
    sizes: ['M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 14,
    isActive: true,
    badge: 'TRENDING',
    tech: 'HYDRO-WICK',
  },
  {
    _id: 'prod-8',
    title: 'Endurance Core Heavyweight Tee',
    slug: 'endurance-core-heavyweight-tee',
    category: 'Sports T-Shirts',
    description: 'Premium heavyweight athletic cotton-poly blend with boxy athletic cut.',
    price: 1699,
    discountPrice: 1399,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 9,
    isActive: true,
    badge: 'SAVE 20%',
    tech: 'DURASHIELD™',
  },
];

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL GEAR');
  const [selectedSize, setSelectedSize] = useState('ALL');
  const [sortBy, setSortBy] = useState('featured');
  const [categoriesList, setCategoriesList] = useState<string[]>([
    'ALL GEAR',
    'Sports T-Shirts',
    'Track Pants',
    'Sports Caps',
  ]);
  const [products, setProducts] = useState<Product[]>(STITCH_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlQuery = searchParams?.get('search') || '';
    setSearchQuery(urlQuery);
    const cat = searchParams?.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getCategories();
        if (res.success && res.data && res.data.length > 0) {
          setCategoriesList(['ALL GEAR', ...res.data.map((c) => c.name)]);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const res = await getProducts({
          category: searchQuery.trim() ? undefined : selectedCategory,
          size: selectedSize,
          sort: sortBy,
          search: searchQuery.trim() || undefined,
        });

        const applyRelevanceFilter = (items: Product[], rawQuery: string) => {
          const q = rawQuery.toLowerCase().trim();
          const isCap = q.includes('cap');
          const isTee = q.includes('tshirt') || q.includes('t-shirt') || q.includes('tee') || q.includes('shirt') || q.includes('top');
          const isPant = q.includes('pant') || q.includes('jogger') || q.includes('track');

          return items.filter((p) => {
            const catName = typeof p.category === 'string' ? p.category : p.category?.name || '';
            const titleLower = p.title.toLowerCase();
            const descLower = p.description.toLowerCase();
            const catLower = catName.toLowerCase();
            const techLower = (p.tech || '').toLowerCase();

            if (isCap && !isTee && !isPant) {
              return titleLower.includes('cap') || catLower.includes('cap') || descLower.includes('cap');
            }
            if (isTee && !isCap && !isPant) {
              return (
                titleLower.includes('tee') ||
                titleLower.includes('shirt') ||
                titleLower.includes('top') ||
                catLower.includes('t-shirt') ||
                catLower.includes('shirt') ||
                descLower.includes('shirt')
              );
            }
            if (isPant && !isCap && !isTee) {
              return (
                titleLower.includes('pant') ||
                titleLower.includes('jogger') ||
                catLower.includes('track') ||
                descLower.includes('pant')
              );
            }

            return (
              titleLower.includes(q) ||
              catLower.includes(q) ||
              descLower.includes(q) ||
              techLower.includes(q)
            );
          });
        };

        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          if (searchQuery.trim()) {
            setProducts(applyRelevanceFilter(res.data, searchQuery));
          } else {
            setProducts(res.data);
          }
        } else if (searchQuery.trim()) {
          const matched = applyRelevanceFilter(STITCH_PRODUCTS, searchQuery);
          setProducts(matched);
        } else if (selectedCategory === 'ALL GEAR' && selectedSize === 'ALL') {
          setProducts(STITCH_PRODUCTS);
        } else {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        setProducts(STITCH_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [selectedCategory, selectedSize, sortBy, searchQuery]);

  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery);
    setSelectedCategory('ALL GEAR');
    setSelectedSize('ALL');
    if (newQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(newQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      <Navbar onSearchSubmit={handleSearch} />
      <CartDrawer />

      <main className="flex-1 py-8 sm:py-12 bg-neutral-50/50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Active Search Banner */}
          {searchQuery && (
            <div className="mb-6 p-4 bg-white border border-neutral-200 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-neutral-500 font-medium">Search results for: </span>
                  <span className="font-headline text-sm sm:text-base font-extrabold uppercase text-neutral-950 bg-neutral-100 px-2.5 py-0.5 rounded border border-neutral-200">
                    &quot;{searchQuery}&quot;
                  </span>
                  <span className="ml-2 text-xs font-bold text-red-600">
                    ({products.length} {products.length === 1 ? 'item' : 'items'} found)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSearch('')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 hover:bg-red-600 text-white text-xs font-headline font-extrabold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Search</span>
              </button>
            </div>
          )}

          {/* Filter and Sorting Bar */}
          <ProductFilter
            categories={categoriesList}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultsCount={products.length}
          />

          {/* Dynamic Product Grid */}
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
              <p className="font-headline text-xs font-bold uppercase tracking-widest text-neutral-500">
                FETCHING ATHLETIC GEAR...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 sm:py-24 text-center max-w-md mx-auto px-4 bg-white border border-neutral-200 rounded-2xl shadow-sm my-6">
              <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-headline text-xl sm:text-2xl font-black uppercase text-neutral-950 mb-2">
                NO PRODUCTS FOUND
              </h3>
              <p className="text-sm text-neutral-500 mb-6">
                {searchQuery
                  ? `No gear found for "${searchQuery}". Try a different keyword like "Caps", "T-Shirts", or "Track Pants".`
                  : 'No products match the selected filters.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  handleSearch('');
                  setSelectedCategory('ALL GEAR');
                  setSelectedSize('ALL');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs font-extrabold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>VIEW ALL GEAR</span>
              </button>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
