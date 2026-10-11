'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Flame, ShoppingCart, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isHomeActive = pathname === '/';
  const isStoreActive = pathname.startsWith('/products');
  const isAdminActive = pathname.startsWith('/admin');
  const isProfileActive = pathname.startsWith('/profile') || pathname.startsWith('/login') || pathname.startsWith('/register');

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:hidden safe-area-bottom"
    >
      <div className={`grid ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} h-15 max-w-lg mx-auto items-center px-1`}>
        {/* 1. HOME TAB */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
            isHomeActive
              ? 'text-red-600 font-bold'
              : 'text-neutral-500 hover:text-neutral-900 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] uppercase font-headline tracking-wider mt-1">
            Home
          </span>
        </Link>

        {/* 2. STORE / PRODUCTS TAB */}
        <Link
          href="/products"
          className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
            isStoreActive
              ? 'text-red-600 font-bold'
              : 'text-neutral-500 hover:text-neutral-900 font-medium'
          }`}
        >
          <Flame className={`w-5 h-5 transition-transform ${isStoreActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] uppercase font-headline tracking-wider mt-1">
            Store
          </span>
        </Link>

        {/* 3. CART TAB */}
        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center py-1.5 text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer transition-colors"
          aria-label={`Open Cart with ${totalItems} items`}
        >
          <div className="relative inline-flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase font-headline tracking-wider mt-1">
            Cart
          </span>
        </button>

        {/* 4. ADMIN TAB (Only shown for Admin users) */}
        {isAdmin && (
          <Link
            href="/admin"
            prefetch={false}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
              isAdminActive
                ? 'text-red-600 font-bold'
                : 'text-neutral-700 hover:text-red-600 font-medium'
            }`}
          >
            <div className="relative inline-flex items-center justify-center">
              <ShieldCheck className={`w-5 h-5 transition-transform ${isAdminActive ? 'scale-110 text-red-600 stroke-[2.4]' : 'text-neutral-700 stroke-[1.8]'}`} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            </div>
            <span className="text-[10px] uppercase font-headline tracking-wider mt-1 text-red-600 font-bold">
              Admin
            </span>
          </Link>
        )}

        {/* 5. ACCOUNT / PROFILE TAB */}
        <Link
          href={isAuthenticated ? '/profile' : '/login?redirect=/profile'}
          className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
            isProfileActive
              ? 'text-red-600 font-bold'
              : 'text-neutral-500 hover:text-neutral-900 font-medium'
          }`}
        >
          {isAuthenticated && user ? (
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black font-headline transition-transform ${
              isProfileActive
                ? 'bg-red-600 text-white ring-2 ring-red-600/30 scale-110'
                : 'bg-neutral-900 text-white'
            }`}>
              {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
            </div>
          ) : (
            <UserIcon className={`w-5 h-5 transition-transform ${isProfileActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          )}
          <span className="text-[10px] uppercase font-headline tracking-wider mt-1 truncate max-w-[70px]">
            {isAuthenticated && user ? (user.name?.split(' ')[0] || 'Account') : 'Account'}
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
