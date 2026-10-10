'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Truck,
  RotateCcw,
  Tag,
  CheckCircle2,
  ArrowLeft,
  Flame,
} from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../lib/utils';
import Navbar from '../../../components/common/Navbar';
import Footer from '../../../components/common/Footer';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotal,
    removeFromCart,
    updateQuantity,
    clearCart,
    freeShippingThreshold,
    freeShippingRemaining,
    hasUnlockedFreeShipping,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const shippingCost = hasUnlockedFreeShipping || subtotal === 0 ? 0 : 149;
  const estimatedTax = Math.round(subtotal * 0.12);
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost + estimatedTax);

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === 'CHAMPION10' || couponCode.toUpperCase() === 'SPORT10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon. Use CHAMPION10 for 10% OFF.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f1f2f4] flex flex-col justify-between text-neutral-900">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:py-24 w-full text-center">
          <div className="bg-white p-8 sm:p-12 rounded-xl border border-neutral-200 shadow-sm max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-headline text-2xl font-black uppercase text-neutral-950">
              YOUR ATHLETIC BAG IS EMPTY
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Looks like you haven&apos;t added any championship gear to your kit yet. Explore our latest drops!
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs sm:text-sm font-extrabold uppercase tracking-wider px-6 py-3.5 rounded-lg transition-colors cursor-pointer shadow-md"
              >
                EXPLORE GEAR <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f2f4] flex flex-col justify-between text-neutral-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
              <Link href="/" className="hover:text-neutral-900">Home</Link>
              <span>/</span>
              <span className="text-neutral-900 font-semibold">Shopping Bag</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
              YOUR ATHLETIC BAG ({totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'})
            </h1>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-red-600 transition-colors cursor-pointer"
          >
            Clear Bag
          </button>
        </div>

        {/* Free Shipping Tracker */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
            {hasUnlockedFreeShipping ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-extrabold">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> FREE EXPRESS SHIPPING UNLOCKED!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-neutral-700">
                <Zap className="w-4 h-4 text-red-600 fill-red-600" />
                ADD {formatPrice(freeShippingRemaining)} MORE FOR FREE SHIPPING
              </span>
            )}
            <span className="font-headline text-xs font-black text-neutral-600">
              {formatPrice(subtotal)} / {formatPrice(freeShippingThreshold)}
            </span>
          </div>

          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                hasUnlockedFreeShipping ? 'bg-emerald-500' : 'bg-red-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Bag Items List (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-neutral-200 shadow-xs divide-y divide-neutral-100 overflow-hidden">
            {items.map((item) => {
              const activePrice = item.product.discountPrice || item.product.price;
              const productUrl = `/products/${item.product.slug || item.product._id}`;

              return (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start sm:items-center">
                  <div className="flex items-center gap-4 min-w-0">
                    <Link href={productUrl} className="relative w-20 h-24 sm:w-24 sm:h-28 bg-neutral-100 rounded-lg border border-neutral-200 overflow-hidden shrink-0">
                      <Image
                        src={item.product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    <div className="min-w-0">
                      <p className="font-headline text-[10px] sm:text-xs font-black uppercase tracking-wider text-red-600">
                        {typeof item.product.category === 'object' ? item.product.category.name : item.product.category}
                      </p>
                      <Link href={productUrl} className="hover:text-red-600 transition-colors">
                        <h3 className="font-headline text-sm sm:text-base font-extrabold uppercase text-neutral-950 truncate mt-0.5">
                          {item.product.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 text-xs font-bold text-neutral-800">
                          Size: {item.size}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-headline text-base sm:text-lg font-black text-neutral-950">
                          {formatPrice(activePrice)}
                        </span>
                        {item.product.discountPrice && item.product.discountPrice < item.product.price && (
                          <span className="text-xs text-neutral-400 line-through">
                            {formatPrice(item.product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <div className="flex items-center border border-neutral-300 rounded bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-headline text-xs font-black text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, Math.min(item.product.stock, item.quantity + 1))}
                        className="px-3 py-1 font-bold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-headline text-base font-black text-neutral-950 sm:hidden">
                      {formatPrice(activePrice * item.quantity)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary & Checkout (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Coupon Code Box */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200 shadow-xs space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-headline font-bold uppercase tracking-wider text-neutral-900">
                <Tag className="w-3.5 h-3.5 text-red-600" />
                <span>HAVE A PROMO CODE?</span>
              </div>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. CHAMPION10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-neutral-50 border border-neutral-300 rounded px-3 py-2 text-xs uppercase font-mono text-neutral-900 flex-1 focus:outline-none focus:border-red-600"
                />
                <button
                  type="submit"
                  className="bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors cursor-pointer"
                >
                  APPLY
                </button>
              </form>

              {couponApplied && (
                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 10% ATHLETE DISCOUNT APPLIED!
                </p>
              )}
              {couponError && (
                <p className="text-[11px] text-red-600 font-semibold">{couponError}</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
              <h3 className="font-headline text-sm font-black uppercase tracking-wider text-neutral-950 pb-3 border-b border-neutral-100">
                ORDER SUMMARY
              </h3>

              <div className="space-y-2 text-xs font-bold uppercase tracking-wider text-neutral-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="text-neutral-950 font-black">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className={shippingCost === 0 ? 'text-emerald-600 font-black' : 'text-neutral-950'}>
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated GST (12%)</span>
                  <span className="text-neutral-950">{formatPrice(estimatedTax)}</span>
                </div>

                <div className="pt-3 border-t border-neutral-200 flex justify-between items-baseline text-sm font-headline text-neutral-950">
                  <span className="font-black text-base">TOTAL PAYABLE</span>
                  <span className="text-xl sm:text-2xl font-black text-neutral-950">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-headline text-sm font-extrabold tracking-wider uppercase py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Trust Badges */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase text-neutral-500 border-t border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                  <span>100% SECURE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-700" />
                  <span>EASY 30-DAY RETURN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
