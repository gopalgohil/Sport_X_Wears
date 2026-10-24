'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, Search, RotateCcw } from 'lucide-react';
import { Product, Category } from '../../../types';
import Navbar from '../../../components/common/Navbar';
import Footer from '../../../components/common/Footer';
import ProductGrid from '../../../components/product/ProductGrid';
import ProductFilter from '../../../components/product/ProductFilter';
import { getProducts, getCategories } from '../../../lib/api';
import { filterProducts } from '../../../lib/utils';
import {
  getCachedProducts,
  getCachedCategories,
  saveCachedProducts,
  saveCachedCategories,
  FALLBACK_PRODUCTS,
  FALLBACK_CATEGORIES,
} from '../../../lib/initialData';

export default function ProductsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL PRODUCTS');
  const [selectedSize, setSelectedSize] = useState('ALL');
  const [sortBy, setSortBy] = useState('featured');
  const [categoriesList, setCategoriesList] = useState<string[]>([
    'ALL PRODUCTS',
    'Sports T-Shirts',
    'Track Pants',
    'Sports Caps',
  ]);
  const [categoriesData, setCategoriesData] = useState<Category[]>(FALLBACK_CATEGORIES);

  // Master catalog holding full inventory
  const [allProducts, setAllProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  // Displayed filtered products (updates in 0ms on click)
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initial cached data load & URL params sync
  useEffect(() => {
    let initialCat = 'ALL PRODUCTS';
    let initialSearch = '';

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get('search') || '';
      const cat = params.get('category') || '';
      if (urlQuery) {
        initialSearch = urlQuery;
        setSearchQuery(urlQuery);
      }
      if (cat) {
        initialCat = cat;
        setSelectedCategory(cat);
      }
    }

    const cachedCats = getCachedCategories();
    if (cachedCats && cachedCats.length > 0) {
      setCategoriesData(cachedCats);
      setCategoriesList(['ALL PRODUCTS', ...cachedCats.map((c) => c.name)]);
    }

    const cached = getCachedProducts();
    if (cached && cached.length > 0) {
      setAllProducts(cached);
      setProducts(
        filterProducts(
          cached,
          {
            category: initialCat,
            size: 'ALL',
            sort: 'featured',
            search: initialSearch,
          },
          cachedCats || FALLBACK_CATEGORIES
        )
      );
    }
  }, []);

  // 2. Load dynamic categories in background
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getCategories();
        if (res.success && res.data && res.data.length > 0) {
          setCategoriesData(res.data);
          setCategoriesList(['ALL PRODUCTS', ...res.data.map((c) => c.name)]);
          saveCachedCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  // 3. Fetch full master catalog from server on initial load
  useEffect(() => {
    async function loadFullCatalog() {
      try {
        const res = await getProducts({ limit: 100 });
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setAllProducts(res.data);
          saveCachedProducts(res.data);
        }
      } catch (err) {
        console.warn('Initial full catalog load notice:', err);
      }
    }
    loadFullCatalog();
  }, []);

  // 4. Instant 0ms client-side filter whenever category, size, sort, or search changes
  useEffect(() => {
    // Immediate instant UI update on frame 0
    const filtered = filterProducts(
      allProducts,
      {
        category: selectedCategory,
        size: selectedSize,
        sort: sortBy,
        search: searchQuery,
      },
      categoriesData
    );
    setProducts(filtered);

    // Background server query
    let isCancelled = false;
    async function syncWithServer() {
      try {
        const res = await getProducts({
          category: selectedCategory !== 'ALL PRODUCTS' ? selectedCategory : undefined,
          size: selectedSize !== 'ALL' ? selectedSize : undefined,
          sort: sortBy,
          search: searchQuery.trim() || undefined,
        });

        if (!isCancelled && res.success && Array.isArray(res.data)) {
          if (res.data.length > 0) {
            setProducts(res.data);
          }
          if (!searchQuery.trim() && selectedCategory === 'ALL PRODUCTS' && selectedSize === 'ALL') {
            setAllProducts(res.data);
            saveCachedProducts(res.data);
          }
        }
      } catch (err) {
        console.warn('Server sync error (kept instant client filtered results):', err);
      }
    }

    syncWithServer();
    return () => {
      isCancelled = true;
    };
  }, [selectedCategory, selectedSize, sortBy, searchQuery, allProducts, categoriesData]);

  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery);
    setSelectedCategory('ALL PRODUCTS');
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

      <main className="flex-1 py-6 sm:py-12 bg-neutral-50/50 border-t border-neutral-200 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full">
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
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              if (cat !== 'ALL PRODUCTS') {
                setSearchQuery('');
              }
            }}
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
                LOADING PRODUCTS...
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
                  ? `No products found for "${searchQuery}". Try searching for T-Shirts, Track Pants, or Caps.`
                  : 'No products match the selected filters.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  handleSearch('');
                  setSelectedCategory('ALL PRODUCTS');
                  setSelectedSize('ALL');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs font-extrabold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>VIEW ALL PRODUCTS</span>
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
