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
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

import SearchBar from './SearchBar';
import CartDrawer from '../cart/CartDrawer';
import MobileBottomNav from './MobileBottomNav';

interface NavbarProps {
  onSearchSubmit?: (query: string) => void;
  onSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchSubmit, onSearchClick }) => {
  const { totalItems, openCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead, requestNotificationPermission } = useSocket();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const badgeText = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <>
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-3">
          {/* Athletic Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center group">
              <span className="font-headline text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tighter uppercase italic text-neutral-950 flex items-center">
                SPORT <span className="text-red-600 px-0.5 sm:px-1 transform -skew-x-12 inline-block">X</span> WEAR
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar (Amazon / Flipkart Style) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <SearchBar onSearchSubmit={onSearchSubmit} />
          </div>

          {/* Utility Icons (Search, Auth/Profile, Wishlist, Notifications, Cart) */}
          <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">

            {/* Notification Bell (Live socket updates for Customer) */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    requestNotificationPermission();
                  }}
                  className="p-2 text-neutral-800 hover:text-red-600 transition-colors cursor-pointer relative"
                  aria-label="Order Alerts"
                >
                  <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-red-600 animate-pulse' : ''}`} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                      {badgeText}
                    </span>
                  )}
                </button>

                {/* Customer Notification Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-neutral-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline text-xs font-black uppercase tracking-wider text-neutral-900">
                          Order Alerts
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-600 text-[10px] font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-[10px] text-neutral-500 hover:text-red-600 font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-neutral-400">
                          <Bell className="w-6 h-6 mx-auto mb-1 opacity-40" />
                          <p className="text-xs">No alerts yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            className={`p-3 hover:bg-neutral-50 transition cursor-pointer flex items-start gap-2.5 ${
                              !n.read ? 'bg-red-50/40' : ''
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-neutral-900 truncate">
                                {n.title}
                              </p>
                              <p className="text-[11px] text-neutral-600 line-clamp-2 mt-0.5">
                                {n.message}
                              </p>
                              <span className="text-[9px] text-neutral-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="px-3 pt-2 border-t border-neutral-100 text-center">
                      <Link
                        href="/profile"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-[11px] font-bold text-red-600 hover:underline block py-1"
                      >
                        View My Orders →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Authentication / Profile Menu (Desktop only, mobile uses Bottom Nav) */}
            {isAuthenticated && user ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
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
                          prefetch={false}
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
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-headline font-bold uppercase tracking-wider text-neutral-900 hover:text-red-600 transition-colors"
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

        {/* Mobile Search Bar Row (Amazon / Flipkart Mobile Style) */}
        <div className="block md:hidden pb-3 pt-0.5">
          <SearchBar onSearchSubmit={onSearchSubmit} isMobileFullWidth />
        </div>
      </div>
    </header>
    <CartDrawer />
    <MobileBottomNav />
    </>
  );
};

export default Navbar;
