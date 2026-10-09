'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, AthleticSize } from '../types';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size: AthleticSize, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  hasUnlockedFreeShipping: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Initial demonstration items directly matching the Stitch design
const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 'cart-1',
    product: {
      _id: 'seed-1',
      title: 'Pro-Vent Mesh Seamless Tee',
      slug: 'pro-vent-mesh-seamless-tee',
      category: 'Sports T-Shirts',
      description: 'Engineered with AeroVent™ 4-way hyper-cooling mesh and zero-abrasion seam technology.',
      price: 1899,
      discountPrice: 1499,
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      ],
      stock: 5,
      isActive: true,
      badge: 'SAVE 21%',
    },
    size: 'L',
    quantity: 1,
  },
  {
    id: 'cart-2',
    product: {
      _id: 'seed-4',
      title: 'Velocity Tapered Track Pant 2.0',
      slug: 'velocity-tapered-track-pant-2',
      category: 'Track Pants',
      description: 'Ergonomic taper, water-repellent flex weave for all-weather athletic endurance.',
      price: 2999,
      discountPrice: 2499,
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80',
      ],
      stock: 12,
      isActive: true,
      badge: 'SAVE 17%',
    },
    size: 'M',
    quantity: 1,
  },
  {
    id: 'cart-3',
    product: {
      _id: 'seed-6',
      title: 'AeroStrike Laser-Cut Performance Cap',
      slug: 'aerostrike-laser-cut-performance-cap',
      category: 'Sports Caps',
      description: 'Laser-perforated moisture-wicking headwear with aerodynamic flex sweatband.',
      price: 1299,
      discountPrice: 999,
      sizes: ['M'],
      images: [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
      ],
      stock: 20,
      isActive: true,
      badge: 'SAVE 23%',
    },
    size: 'M',
    quantity: 1,
  },
];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (product: Product, size: AthleticSize, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product._id === product._id && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newItem: CartItem = {
        id: `${product._id}-${size}-${Date.now()}`,
        product,
        size,
        quantity,
      };
      return [newItem, ...prev];
    });

    setIsOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => {
    const itemPrice = item.product.discountPrice || item.product.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  const freeShippingThreshold = 1999;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const hasUnlockedFreeShipping = subtotal >= freeShippingThreshold;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        freeShippingThreshold,
        freeShippingRemaining,
        hasUnlockedFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
