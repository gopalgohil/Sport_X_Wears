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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-white border-l border-neutral-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h3 className="font-headline text-xl font-extrabold uppercase tracking-wider text-neutral-950">
                YOUR BAG ({totalItems})
              </h3>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-200 transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-neutral-100/90 text-neutral-900 border-b border-neutral-200">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
              {hasUnlockedFreeShipping ? (
                <span className="flex items-center gap-1.5 text-emerald-600 font-extrabold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> YOU UNLOCKED FREE EXPRESS SHIPPING!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-neutral-700">
                  <Zap className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                  ADD {formatPrice(freeShippingRemaining)} FOR FREE 2-DAY DELIVERY
                </span>
              )}
              <span className="font-headline text-xs font-black text-neutral-600">
                {formatPrice(subtotal)} / {formatPrice(freeShippingThreshold)}
              </span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full bg-neutral-200 h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  hasUnlockedFreeShipping ? 'bg-emerald-500' : 'bg-red-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="py-24 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-headline text-xl font-bold uppercase text-neutral-800">
                  YOUR ATHLETIC BAG IS EMPTY
                </h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Equip yourself with elite performance gear tested by champions.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-2 bg-neutral-950 text-white font-headline text-xs font-bold uppercase tracking-wider px-6 py-3 hover:bg-red-600 transition-colors cursor-pointer"
                >
                  EXPLORE COLLECTIONS
                </button>
              </div>
            ) : (
              items.map((item) => <CartItem key={item.id} item={item} />)
            )}
          </div>

          {/* Footer Order Summary & Checkout Action */}
          {items.length > 0 && (
            <div className="border-t border-neutral-200 bg-neutral-50/70 p-6 space-y-4">
              <div className="space-y-2 text-xs font-bold uppercase tracking-wider text-neutral-600">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span className="text-neutral-950 font-black">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>EXPRESS 2-DAY SHIPPING</span>
                  <span className={shippingCost === 0 ? 'text-emerald-600 font-black' : 'text-neutral-950'}>
                    {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ESTIMATED TAX</span>
                  <span className="text-neutral-950">{formatPrice(estimatedTax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-headline text-neutral-950">
                  <span className="font-extrabold">ESTIMATED TOTAL</span>
                  <span className="text-xl font-black text-neutral-950">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-headline text-base font-extrabold tracking-wider uppercase py-4 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                PROCEED TO CHECKOUT <ArrowRight className="w-5 h-5" />
              </Link>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-wider text-neutral-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" /> 256-BIT ENCRYPTION
                </span>
                <span>•</span>
                <span>30-DAY GUARANTEE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
