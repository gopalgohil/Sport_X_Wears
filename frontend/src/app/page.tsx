'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight, Zap, ShieldCheck, Award, Flame, Loader2 } from 'lucide-react';
import { Product } from '../types';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilter from '../components/product/ProductFilter';
import { getProducts, getCategories } from '../lib/api';

// The 8 flagship athletic products generated in the Stitch project
const STITCH_PRODUCTS: Product[] = [
  {
    _id: 'prod-1',
    title: 'Pro-Vent Mesh Seamless Tee',
    slug: 'pro-vent-mesh-seamless-tee',
    category: 'Sports T-Shirts',
    description: 'Engineered with AeroVent™ 4-way micro-cooling mesh and zero-abrasion seam technology. Tested by elite athletes for supreme ventilation.',
    price: 1899,
    discountPrice: 1499,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
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
    description: 'Targeted muscle compression with thermo-reactive heat dispersal channels. Enhances circulation and accelerates lactic acid recovery.',
    price: 2299,
    discountPrice: 1799,
    sizes: ['M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
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
    description: 'Ultra-lightweight fabric engineered for multi-sport agility. Absorbs moisture rapidly and dries 4x faster than conventional cotton.',
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
    description: 'Ergonomic tapered silhouette with water-repellent flex weave and deep zippered storm pockets. Built for track drills and recovery.',
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
    description: 'Windproof micro-ripstop shell bonded to a brushed fleece thermal liner. Defies freezing track temperatures with zero weight penalty.',
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
    description: 'Ultralight structured crown with 48 laser-cut heat vent ports, aerodynamic curved brim, and moisture-absorbing sweatband.',
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
    description: 'Breathable ballistic mesh back panels paired with water-resistant front crown. Snapback closure customized for running and workouts.',
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
    description: 'Premium heavyweight athletic cotton-poly blend with boxy athletic cut. Built for brutal lifting sessions and day-off comfort.',
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



export default function HomePage() {
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

  // Fetch dynamic products from backend API when filters or sort change
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const res = await getProducts({
          category: selectedCategory,
          size: selectedSize,
          sort: sortBy,
        });

        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data);
        } else if (selectedCategory === 'ALL GEAR' && selectedSize === 'ALL') {
          // Fallback gracefully to stitch products if initial backend payload is empty
          setProducts(STITCH_PRODUCTS);
        } else {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load dynamic products:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [selectedCategory, selectedSize, sortBy]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Mini Cart Slide-over Drawer */}
      <CartDrawer />

      <main className="flex-1">
        {/* =========================================
            1. HERO SECTION (Clean White Athletic Canvas)
           ========================================= */}
        <section className="relative w-full bg-gradient-to-b from-neutral-50 via-white to-white py-14 sm:py-20 lg:py-24 border-b border-neutral-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Column: Athletic Typography & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                {/* Top Tagline Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-50 border border-red-200 text-red-600 font-headline text-xs sm:text-sm font-extrabold uppercase tracking-widest">
                  <Flame className="w-4 h-4 text-red-600 fill-red-600" />
                  UNLEASH PEAK PERFORMANCE
                </div>

                {/* Main Display Headline */}
                <h1 className="font-headline text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.9] text-neutral-950">
                  BUILT FOR <br />
                  <span className="text-red-600">CHAMPIONS</span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-neutral-600 font-normal max-w-xl leading-relaxed">
                  Engineered with AeroVent™ hyper-cooling fabrics and zero-abrasion seam technology. Tested by elite athletes for uncompromising endurance.
                </p>

                {/* Action CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <a
                    href="#products-section"
                    onClick={() => setSelectedCategory('Sports T-Shirts')}
                    className="bg-red-600 hover:bg-red-700 text-white font-headline text-base font-extrabold tracking-wider uppercase px-8 py-4 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:shadow-red-600/20 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    SHOP T-SHIRTS <ArrowRight className="w-5 h-5" />
                  </a>

                  <a
                    href="#products-section"
                    onClick={() => setSelectedCategory('ALL GEAR')}
                    className="border-2 border-neutral-950 hover:bg-neutral-950 hover:text-white text-neutral-950 font-headline text-base font-extrabold tracking-wider uppercase px-8 py-4 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    EXPLORE COLLECTION
                  </a>
                </div>
              </div>

              {/* Right Column: High-Impact Athletic Visual */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/5] w-full bg-neutral-100 border border-neutral-200 shadow-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80"
                    alt="Elite Athlete in Training"
                    fill
                    priority
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/95 backdrop-blur-md border border-neutral-200 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-headline text-[10px] font-extrabold uppercase tracking-widest text-red-600">
                          PRO-SERIES DROP 01
                        </p>
                        <h4 className="font-headline text-base font-black uppercase text-neutral-950">
                          AEROVENT™ HYPER-COOLING SYSTEM
                        </h4>
                      </div>
                      <span className="font-headline text-xs font-bold uppercase px-2.5 py-1 bg-neutral-950 text-white">
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
        <section id="products-section" className="py-8 sm:py-12 bg-neutral-50/50 border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

            {/* Dynamic Product Grid with Loading State */}
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                <p className="font-headline text-xs font-bold uppercase tracking-widest text-neutral-500">
                  FETCHING LIVE ATHLETIC INVENTORY...
                </p>
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
