'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, Search, RotateCcw } from 'lucide-react';
import { Product } from '../../../types';
import Navbar from '../../../components/common/Navbar';
import Footer from '../../../components/common/Footer';
import ProductGrid from '../../../components/product/ProductGrid';
import ProductFilter from '../../../components/product/ProductFilter';
import { getProducts, getCategories } from '../../../lib/api';

export default function ProductsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL GEAR');
  const [selectedSize, setSelectedSize] = useState('ALL');
  const [sortBy, setSortBy] = useState('featured');
  const [categoriesList, setCategoriesList] = useState<string[]>(['ALL GEAR']);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get('search') || '';
      if (urlQuery) setSearchQuery(urlQuery);
      const cat = params.get('category');
      if (cat) setSelectedCategory(cat);
    }
  }, []);

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
          category: selectedCategory !== 'ALL GEAR' ? selectedCategory : undefined,
          size: selectedSize !== 'ALL' ? selectedSize : undefined,
          sort: sortBy,
          search: searchQuery.trim() || undefined,
        });

        if (res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        setProducts([]);
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
