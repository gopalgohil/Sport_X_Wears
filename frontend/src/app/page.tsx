'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, ShieldCheck, Award, Flame, Loader2, X, Search, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilter from '../components/product/ProductFilter';
import { getProducts, getCategories } from '../lib/api';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL GEAR');
  const [selectedSize, setSelectedSize] = useState('ALL');
  const [sortBy, setSortBy] = useState('featured');
  const [categoriesList, setCategoriesList] = useState<string[]>(['ALL GEAR']);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync search query from URL params if present on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get('search') || '';
      if (urlQuery) {
        setSearchQuery(urlQuery);
      }
      const urlCat = params.get('category') || '';
      if (urlCat) {
        setSelectedCategory(urlCat);
      }
    }
  }, []);

  // Fetch dynamic categories from backend MongoDB Atlas
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getCategories();
        if (res.success && res.data && res.data.length > 0) {
          setCategoriesList(['ALL GEAR', ...res.data.map((c) => c.name)]);
        }
      } catch (err) {
        console.error('Failed to load dynamic categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch dynamic products from backend API when filters, sort, or search change
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
        console.error('Failed to load dynamic products:', err);
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
      router.push(`/?search=${encodeURIComponent(newQuery.trim())}#products-section`);
    } else {
      router.push('/');
    }

    // Smooth scroll to product grid
    setTimeout(() => {
      const section = document.getElementById('products-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* Navigation Bar with Search Integration */}
      <Navbar onSearchSubmit={handleSearch} />

      <main className="flex-1">
        {/* =========================================
            1. HERO SECTION (Clean White Athletic Canvas)
           ========================================= */}
        <section className="relative w-full bg-gradient-to-b from-neutral-50 via-white to-white py-10 sm:py-16 lg:py-24 border-b border-neutral-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
              {/* Left Column: Athletic Typography & CTAs (Centered on Mobile, Left-aligned on Desktop) */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
                {/* Top Tagline Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-50 border border-red-200 text-red-600 font-headline text-xs sm:text-sm font-extrabold uppercase tracking-widest rounded-full lg:rounded-none">
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 fill-red-600 shrink-0" />
                  <span>UNLEASH PEAK PERFORMANCE</span>
                </div>

                {/* Main Display Headline */}
                <h1 className="font-headline text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight leading-[0.95] text-neutral-950">
                  BUILT FOR <br className="hidden sm:inline" />
                  <span className="text-red-600">CHAMPIONS</span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base lg:text-lg text-neutral-600 font-normal max-w-xl leading-relaxed">
                  Engineered with AeroVent™ hyper-cooling fabrics and zero-abrasion seam technology. Tested by elite athletes for uncompromising endurance.
                </p>

                {/* Action CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
                  <a
                    href="#products-section"
                    onClick={() => setSelectedCategory('Sports T-Shirts')}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-headline text-sm sm:text-base font-extrabold tracking-wider uppercase px-6 sm:px-8 py-3.5 sm:py-4 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:shadow-red-600/20 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 rounded-xs"
                  >
                    SHOP T-SHIRTS <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>

                  <a
                    href="#products-section"
                    onClick={() => setSelectedCategory('ALL GEAR')}
                    className="w-full sm:w-auto border-2 border-neutral-950 hover:bg-neutral-950 hover:text-white text-neutral-950 font-headline text-sm sm:text-base font-extrabold tracking-wider uppercase px-6 sm:px-8 py-3.5 sm:py-4 flex items-center justify-center gap-2 transition-all cursor-pointer rounded-xs"
                  >
                    EXPLORE COLLECTION
                  </a>
                </div>
              </div>

              {/* Right Column: High-Impact Athletic Visual */}
              <div className="lg:col-span-5 relative w-full max-w-md lg:max-w-none mx-auto">
                <div className="relative aspect-[4/5] w-full bg-neutral-100 border border-neutral-200 shadow-xl overflow-hidden rounded-xl lg:rounded-none">
                  <Image
                    src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80"
                    alt="Elite Athlete in Training"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 p-3 sm:p-4 bg-white/95 backdrop-blur-md border border-neutral-200 shadow-lg rounded-lg lg:rounded-none">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-headline text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-red-600">
                          PRO-SERIES DROP 01
                        </p>
                        <h4 className="font-headline text-xs sm:text-base font-black uppercase text-neutral-950">
                          AEROVENT™ HYPER-COOLING SYSTEM
                        </h4>
                      </div>
                      <span className="font-headline text-[10px] sm:text-xs font-bold uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 bg-neutral-950 text-white rounded-xs">
                        TESTED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* =========================================
            3. PRODUCT GRID & FILTER LAYOUT
           ========================================= */}
        <section id="products-section" className="py-8 sm:py-12 bg-neutral-50/50 border-t border-neutral-200 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Active Search Filter Banner */}
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

            {/* Dynamic Product Grid with Loading & Empty State */}
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                <p className="font-headline text-xs font-bold uppercase tracking-widest text-neutral-500">
                  FETCHING LIVE ATHLETIC INVENTORY...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 sm:py-24 text-center max-w-md mx-auto px-4 bg-white border border-neutral-200 rounded-2xl shadow-sm my-6">
                <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-headline text-xl sm:text-2xl font-black uppercase text-neutral-950 mb-2">
                  NO ATHLETIC GEAR FOUND
                </h3>
                <p className="text-sm text-neutral-500 mb-6">
                  {searchQuery
                    ? `We couldn't find any products matching "${searchQuery}". Check the spelling or try searching for "Caps", "T-Shirts", or "Track Pants".`
                    : 'No products match the selected filters. Try changing or resetting your filters.'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
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
                  {categoriesList
                    .filter((c) => c !== 'ALL GEAR')
                    .slice(0, 4)
                    .map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSearchQuery('');
                        }}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-headline text-xs font-bold uppercase rounded transition-colors cursor-pointer"
                      >
                        {cat}
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
