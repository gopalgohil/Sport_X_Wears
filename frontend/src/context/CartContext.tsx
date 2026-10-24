'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem, AthleticSize } from '../types';
import { useAuth } from './AuthContext';

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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Track the user ID associated with currently active cart
  const activeUserRef = useRef<string | null>(null);

  // Helper to obtain user-isolated storage key
  const getStorageKey = (userId?: string | null) => {
    return userId ? `sportxwear_cart_${userId}` : 'sportxwear_cart_guest';
  };

  // Sync cart whenever active user changes (login, register, logout, or session load)
  useEffect(() => {
    if (authLoading) return;

    const currentUserId = user?._id || null;

    if (activeUserRef.current !== currentUserId || !isHydrated) {
      activeUserRef.current = currentUserId;

      try {
        if (typeof window !== 'undefined') {
          // Remove legacy un-scoped cart key so old items never leak into new users
          localStorage.removeItem('sportxwear_cart');

          const key = getStorageKey(currentUserId);
          const savedCart = localStorage.getItem(key);

          if (savedCart) {
            const parsed = JSON.parse(savedCart);
            setItems(Array.isArray(parsed) ? parsed : []);
          } else {
            // New user has 0 items until they explicitly add something
            setItems([]);
          }
        }
      } catch (e) {
        console.error('Failed to load user-isolated cart from localStorage', e);
        setItems([]);
      } finally {
        setIsHydrated(true);
      }
    }
  }, [user?._id, authLoading, isHydrated]);

  // Save cart to user-isolated storage key when items change
  useEffect(() => {
    if (isHydrated && !authLoading) {
      try {
        if (typeof window !== 'undefined') {
          const key = getStorageKey(activeUserRef.current);
          localStorage.setItem(key, JSON.stringify(items));
        }
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [items, isHydrated, authLoading]);

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

  const clearCart = () => {
    setItems([]);
    try {
      if (typeof window !== 'undefined') {
        const key = getStorageKey(activeUserRef.current);
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('Failed to clear cart in localStorage', e);
    }
  };

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
