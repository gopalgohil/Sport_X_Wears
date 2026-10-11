'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Package,
  ShieldCheck,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCart } from '../../context/CartContext';

import SearchBar from './SearchBar';
import CartDrawer from '../cart/CartDrawer';
import MobileBottomNav from './MobileBottomNav';

interface NavbarProps {
  onSearchSubmit?: (query: string) => void;
  onSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchSubmit, onSearchClick }) => {
  const { user, isAuthenticated, requestLogout } = useAuth();
  const { totalItems, openCart } = useCart();
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
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Athletic Brand Logo (Left Side on Desktop & Mobile) */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center group">
              <span className="font-headline text-xl sm:text-2xl md:text-3xl font-black tracking-tight uppercase italic text-neutral-950 flex items-center transition-transform group-hover:scale-[1.02]">
                SPORT <span className="text-red-600 px-1 transform -skew-x-12 inline-block">X</span> WEAR
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar (Amazon / Flipkart Style) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-8">
            <SearchBar onSearchSubmit={onSearchSubmit} />
          </div>

          {/* Utility Icons (Auth/Profile, Notifications, Cart) */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
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
                          requestLogout();
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


            {/* Dynamic Notification Bell Trigger (In place of Cart Icon) */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  if (isAuthenticated) {
                    requestNotificationPermission();
                  }
                }}
                className="relative p-2 text-neutral-900 hover:text-red-600 transition-colors cursor-pointer group"
                aria-label="Order & Store Notifications"
              >
                <div className="relative inline-flex items-center justify-center">
                  <Bell className={`w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2] transition-transform group-hover:scale-110 ${
                    unreadCount > 0 ? 'text-red-600 animate-pulse' : 'text-neutral-900'
                  }`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] sm:text-[11px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                      {badgeText}
                    </span>
                  )}
                </div>
              </button>

              {/* Dynamic Notification Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-neutral-200/90 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                      <span className="font-headline text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-950">
                        Live Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-black">
                          {unreadCount} NEW
                        </span>
                      )}
                    </div>
                    {isAuthenticated && unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-[11px] text-neutral-500 hover:text-red-600 font-bold tracking-tight cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                    {!isAuthenticated ? (
                      <div className="py-8 px-4 text-center">
                        <Bell className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-neutral-800">Sign in for Live Updates</p>
                        <p className="text-[11px] text-neutral-400 mt-1 mb-3">
                          Receive real-time order alerts, status tracking, and dispatch updates directly to your device.
                        </p>
                        <Link
                          href="/login"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="inline-block px-4 py-1.5 bg-neutral-950 text-white text-xs font-headline font-black uppercase tracking-wider rounded-lg hover:bg-red-600 transition"
                        >
                          Sign In Now
                        </Link>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 text-center text-neutral-400">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-semibold text-neutral-600">No new notifications</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">You're completely up to date!</p>
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n._id}
                          onClick={() => markAsRead(n._id)}
                          className={`p-3.5 hover:bg-neutral-50 transition cursor-pointer flex items-start gap-3 ${
                            !n.read ? 'bg-red-50/50' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            !n.read ? 'bg-red-600 text-white' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-extrabold text-neutral-950 truncate">
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-600 leading-snug mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                            <span className="text-[9px] text-neutral-400 font-medium mt-1 block">
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

                  {isAuthenticated && (
                    <div className="p-2.5 border-t border-neutral-100 bg-neutral-50/60 text-center">
                      <Link
                        href="/profile"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-xs font-headline font-bold text-red-600 hover:text-red-700 uppercase tracking-wider block py-1"
                      >
                        View My Orders & History &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Shopping Cart Trigger */}
            <button
              type="button"
              onClick={openCart}
              className="hidden md:inline-flex relative p-2 text-neutral-900 hover:text-red-600 transition-colors cursor-pointer group items-center"
              aria-label="Shopping Cart"
            >
              <div className="relative inline-flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2] transition-transform group-hover:scale-110 text-neutral-900 group-hover:text-red-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] sm:text-[11px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in duration-200">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
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
