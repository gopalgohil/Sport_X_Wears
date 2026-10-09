'use client';

import React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const price = item.product.discountPrice || item.product.price;
  const categoryName =
    typeof item.product.category === 'object'
      ? item.product.category.name
      : item.product.category;

  return (
    <div className="flex gap-4 py-4 border-b border-neutral-200">
      {/* Thumbnail */}
      <div className="relative w-20 h-24 bg-neutral-100 shrink-0 border border-neutral-200 overflow-hidden">
        <Image
          src={item.product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
          alt={item.product.title}
          fill
          className="object-cover object-center"
        />
      </div>

      {/* Item Details */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-headline text-base font-extrabold uppercase tracking-wide text-neutral-950 truncate">
              {item.product.title}
            </h4>
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-neutral-400 hover:text-red-600 transition-colors cursor-pointer shrink-0 p-0.5"
              aria-label="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mt-0.5">
            {categoryName}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span className="font-headline text-xs font-bold uppercase px-2 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-800">
              SIZE: {item.size}
            </span>
          </div>
        </div>

        {/* Stepper & Price Row */}
        <div className="flex items-center justify-between mt-3">
          {/* Stepper */}
          <div className="flex items-center border border-neutral-300 bg-white">
            <button
              onClick={() => updateQuantity(item.id, -1)}
              className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-headline text-sm font-bold w-7 text-center select-none text-neutral-900">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, 1)}
              className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Line Total */}
          <span className="font-headline text-base font-black text-neutral-950">
            {formatPrice(price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
