'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CartItem } from './CartItem';
import { formatPrice } from '../../lib/utils';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    totalItems,
    subtotal,
    freeShippingThreshold,
    freeShippingRemaining,
    hasUnlockedFreeShipping,
  } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const shippingCost = hasUnlockedFreeShipping || subtotal === 0 ? 0 : 99;
  const estimatedTax = Math.round(subtotal * 0.12);
  const totalAmount = subtotal + shippingCost + estimatedTax;

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:max-w-md w-full flex">
        {/* Drawer Panel (Mobile Bottom Sheet + Desktop Slide-over) */}
        <div className="w-full max-h-[92vh] sm:max-h-full h-[92vh] sm:h-full bg-white rounded-t-2xl sm:rounded-none border-t sm:border-t-0 sm:border-l border-neutral-200 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
          
          {/* Mobile Drag/Pull Indicator */}
          <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

          {/* Drawer Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h3 className="font-headline text-lg sm:text-xl font-extrabold uppercase tracking-wider text-neutral-950">
                SHOPPING BAG ({totalItems})
              </h3>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator (Amazon/Flipkart Style) */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-neutral-100/90 text-neutral-900 border-b border-neutral-200 shrink-0">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1.5">
              {hasUnlockedFreeShipping ? (
                <span className="flex items-center gap-1.5 text-emerald-600 font-extrabold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> FREE DELIVERY UNLOCKED!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-neutral-700">
                  <Zap className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                  ADD {formatPrice(freeShippingRemaining)} FOR FREE SHIPPING
                </span>
              )}
              <span className="font-headline text-[11px] sm:text-xs font-black text-neutral-600">
                {formatPrice(subtotal)} / {formatPrice(freeShippingThreshold)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  hasUnlockedFreeShipping ? 'bg-emerald-500' : 'bg-red-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-headline text-lg sm:text-xl font-bold uppercase text-neutral-900">
                  YOUR BAG IS EMPTY
                </h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Add athletic gear and essentials to your bag to check out.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-2 bg-neutral-950 text-white font-headline text-xs font-bold uppercase tracking-wider px-6 py-3 hover:bg-red-600 transition-colors cursor-pointer rounded-xs"
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              items.map((item) => <CartItem key={item.id} item={item} />)
            )}
          </div>

          {/* Footer Order Summary & Sticky Checkout Action */}
          {items.length > 0 && (
            <div className="border-t border-neutral-200 bg-white sm:bg-neutral-50/80 p-4 sm:p-6 space-y-3 sm:space-y-4 shrink-0 shadow-lg">
              {/* Desktop Breakdown */}
              <div className="hidden sm:block space-y-1.5 text-xs font-bold uppercase tracking-wider text-neutral-600">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span className="text-neutral-950 font-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ESTIMATED DELIVERY</span>
                  <span className={shippingCost === 0 ? 'text-emerald-600 font-black' : 'text-neutral-950'}>
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>TAX (12% GST)</span>
                  <span className="text-neutral-950">{formatPrice(estimatedTax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-headline text-neutral-950">
                  <span className="font-extrabold">TOTAL AMOUNT</span>
                  <span className="text-xl font-black text-neutral-950">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Mobile Quick Summary Row */}
              <div className="flex sm:hidden items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                    TOTAL PAYABLE
                  </span>
                  <span className="font-headline text-lg font-black text-neutral-950">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                {shippingCost === 0 && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    FREE Shipping
                  </span>
                )}
              </div>

              {/* Checkout CTA Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-headline text-sm sm:text-base font-extrabold tracking-wider uppercase py-3.5 sm:py-4 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer rounded-xs"
              >
                PROCEED TO CHECKOUT ({totalItems}) <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-500 pt-0.5">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-700" /> 100% SECURE
                </span>
                <span>•</span>
                <span>ORIGINAL SPORT GEAR</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
