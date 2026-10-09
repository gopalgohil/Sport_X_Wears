'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Flame,
  Check,
  Loader2,
  Heart,
  Share2,
} from 'lucide-react';
import { Product, AthleticSize } from '../../../../types';
import { getProductById, getProducts } from '../../../../lib/api';
import { formatPrice, getDiscountPercentage } from '../../../../lib/utils';
import { useCart } from '../../../../context/CartContext';
import Navbar from '../../../../components/common/Navbar';
import Footer from '../../../../components/common/Footer';
import CartDrawer from '../../../../components/cart/CartDrawer';
import { ProductCard } from '../../../../components/product/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;

  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<AthleticSize>('M');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Fetch current product & related gear
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const prod = await getProductById(idOrSlug);
        if (prod) {
          setProduct(prod);
          if (prod.sizes && prod.sizes.length > 0) {
            setSelectedSize(prod.sizes[0]);
          }

          // Fetch related products in the same category
          const categorySlug =
            typeof prod.category === 'object'
              ? prod.category.slug
              : prod.category;
          const relatedRes = await getProducts({
            category: categorySlug,
            limit: 4,
          });

          if (relatedRes.success && relatedRes.data) {
            setRelatedProducts(
              relatedRes.data.filter((p) => p._id !== prod._id).slice(0, 4)
            );
          }
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (idOrSlug) {
      loadData();
    }
  }, [idOrSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
          <p className="font-headline text-sm font-bold uppercase tracking-widest text-neutral-500">
            LOADING ATHLETIC SPECIFICATIONS...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-24 text-center">
          <h2 className="font-headline text-3xl font-black uppercase text-neutral-950 mb-3">
            GEAR NOT FOUND
          </h2>
          <p className="text-neutral-600 mb-8">
            The athletic apparel you are looking for is either out of stock or does not exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-red-600 text-white font-headline text-sm font-bold uppercase tracking-wider px-6 py-3.5 transition-colors"
          >
            RETURN TO STOREFRONT <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryName =
    typeof product.category === 'object'
      ? product.category.name
      : product.category;

  const discountPercent = getDiscountPercentage(
    product.price,
    product.discountPrice
  );
  const activePrice = product.discountPrice || product.price;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, quantity);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      <Navbar />
      <CartDrawer />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="bg-neutral-50 border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs font-headline uppercase font-semibold text-neutral-500">
            <Link href="/" className="hover:text-red-600 transition-colors">
              HOME
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/#products-section" className="hover:text-red-600 transition-colors">
              {categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-950 truncate max-w-xs">{product.title}</span>
          </div>
        </div>

        {/* PDP Main Product Showcase */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Left: High-Impact Athletic Visual Gallery (7 cols) */}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
              {/* Vertical Thumbnail Rail */}
              {product.images && product.images.length > 1 && (
                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 pb-2 md:pb-0">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-20 sm:w-20 sm:h-24 bg-neutral-100 border-2 transition-all cursor-pointer shrink-0 overflow-hidden ${
                        selectedImageIndex === idx
                          ? 'border-red-600 shadow-md'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.title} view ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Full-Scale Image Preview */}
              <div className="relative aspect-[3/4] flex-1 bg-neutral-100 border border-neutral-200 overflow-hidden shadow-sm">
                <Image
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-center"
                />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {discountPercent > 0 && (
                    <span className="bg-red-600 text-white font-headline text-xs font-black uppercase tracking-wider px-3 py-1 shadow-sm">
                      SAVE {discountPercent}%
                    </span>
                  )}
                  <span className="bg-neutral-950 text-white font-headline text-xs font-bold uppercase tracking-widest px-3 py-1">
                    PRO-GRADE
                  </span>
                </div>

                {/* Top Right Wishlist & Share */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-2.5 bg-white/95 backdrop-blur-xs text-neutral-800 hover:text-red-600 transition-colors shadow-sm cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted ? 'text-red-600 fill-red-600' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Technical Specs & Add To Bag (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Category & Status */}
                <div className="flex items-center justify-between">
                  <span className="font-headline text-xs font-black uppercase tracking-widest text-red-600">
                    {categoryName}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>IN STOCK ({product.stock} UNITS)</span>
                  </div>
                </div>

                {/* Headline Title */}
                <h1 className="font-headline text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950 leading-tight">
                  {product.title}
                </h1>

                {/* Pricing Block */}
                <div className="flex items-baseline gap-3 pt-1 border-b border-neutral-200 pb-5">
                  <span className="font-headline text-3xl sm:text-4xl font-black text-neutral-950">
                    {formatPrice(activePrice)}
                  </span>
                  {product.discountPrice && product.discountPrice < product.price && (
                    <span className="font-headline text-lg sm:text-xl font-semibold text-neutral-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                  <span className="text-xs text-neutral-500 font-medium">
                    (Inclusive of all taxes)
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Size Selector */}
                <div className="pt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-700">
                    <span>SELECT SIZE: <span className="text-neutral-950 font-black">{selectedSize}</span></span>
                    <span className="text-neutral-400 hover:text-neutral-900 underline cursor-pointer">
                      SIZE GUIDE
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {(['S', 'M', 'L', 'XL', 'XXL'] as AthleticSize[]).map((size) => {
                      const isAvailable = product.sizes.includes(size);
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          disabled={!isAvailable}
                          onClick={() => setSelectedSize(size)}
                          className={`h-12 font-headline text-sm font-bold uppercase transition-all border flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                              : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-950'
                          } ${
                            !isAvailable &&
                            'opacity-30 cursor-not-allowed line-through bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="pt-2 flex items-center gap-4">
                  <span className="font-headline text-xs font-bold uppercase tracking-wider text-neutral-600">
                    QUANTITY:
                  </span>
                  <div className="flex items-center border border-neutral-300 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 font-bold hover:bg-neutral-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-headline text-sm font-black">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 font-bold hover:bg-neutral-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Add to Bag & Buy Now */}
              <div className="space-y-3 pt-6 border-t border-neutral-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`py-4 px-6 font-headline text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-2 border-neutral-950 ${
                      addedAnimation
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-950 hover:bg-neutral-950 hover:text-white'
                    }`}
                  >
                    {addedAnimation ? (
                      <>
                        <Zap className="w-4 h-4 text-red-500 fill-red-500" /> ADDED TO BAG
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> ADD TO BAG
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-headline text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:shadow-red-600/20 cursor-pointer"
                  >
                    BUY NOW <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Trust Highlights */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-100 text-center text-[11px] font-semibold text-neutral-600">
                  <div className="p-2.5 bg-neutral-50 border border-neutral-200 flex flex-col items-center gap-1">
                    <Truck className="w-4 h-4 text-red-600" />
                    <span>Free Shipping &gt; ₹1,999</span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 border border-neutral-200 flex flex-col items-center gap-1">
                    <RotateCcw className="w-4 h-4 text-red-600" />
                    <span>30-Day Sweat Trial</span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 border border-neutral-200 flex flex-col items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <span>100% Olympic Grade</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Athletic Drops */}
        {relatedProducts.length > 0 && (
          <section className="py-16 bg-neutral-50/50 border-t border-neutral-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="font-headline text-xs font-black uppercase tracking-widest text-red-600 mb-1">
                    RECOMMENDED GEAR
                  </p>
                  <h3 className="font-headline text-3xl font-black uppercase tracking-tight text-neutral-950">
                    COMPLETE YOUR KIT
                  </h3>
                </div>
                <Link
                  href="/#products-section"
                  className="font-headline text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  VIEW ALL <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
