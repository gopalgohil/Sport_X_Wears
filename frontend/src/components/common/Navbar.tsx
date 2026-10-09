'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  ShoppingBag,
  Search,
  Heart,
  User as UserIcon,
  LogOut,
  Package,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchClick }) => {
  const { totalItems, openCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Athletic Brand Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <span className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase italic text-neutral-950 flex items-center">
                SPORT <span className="text-red-600 px-1 transform -skew-x-12 inline-block">X</span> WEAR
              </span>
            </Link>
          </div>

          {/* Utility Icons (Search, Auth/Profile, Wishlist, Cart) */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search Trigger */}
            <button
              onClick={onSearchClick}
              className="p-2 text-neutral-800 hover:text-red-600 transition-colors cursor-pointer"
              aria-label="Search athletic gear"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dynamic Authentication / Profile Menu */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Athlete Profile Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-950 text-white font-headline text-xs font-black flex items-center justify-center border border-red-600">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'SX'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <p className="font-headline text-sm font-extrabold uppercase text-neutral-950 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 bg-red-50 text-red-600 border border-red-200 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                        {user.role === 'admin' ? 'Administrator' : 'Elite Athlete'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 hover:text-red-600 transition-colors"
                      >
                        <Package className="w-4 h-4 text-neutral-500" />
                        <span>My Orders & Profile</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 hover:text-red-600 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-red-600" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-neutral-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-headline font-bold uppercase tracking-wider text-neutral-900 hover:text-red-600 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">SIGN IN</span>
              </Link>
            )}

            {/* Wishlist Icon */}
            <button
              className="hidden sm:inline-flex p-2 text-neutral-800 hover:text-red-600 transition-colors cursor-pointer relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </button>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              type="button"
              className="relative p-2 text-neutral-900 hover:text-red-600 transition-colors cursor-pointer group"
              aria-label={`Shopping Cart with ${totalItems} items`}
            >
              <div className="relative inline-flex items-center justify-center">
                {/* Shopping Trolley Icon */}
                <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2] transition-transform group-hover:scale-105" />
                
                {/* Cart item count placed above trolley in black */}
                <span className="absolute -top-1 left-[52%] -translate-x-1/2 text-[11px] sm:text-[12px] font-black text-black leading-none select-none pointer-events-none">
                  {totalItems}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
