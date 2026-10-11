'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  User as UserIcon,
  Bell,
  CheckCheck,
  ShoppingBag,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const {
    unreadCount,
    notifications,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
  } = useSocket();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard Overview';
    if (pathname.startsWith('/admin/notifications')) return 'Live Alerts & Notifications';
    if (pathname.startsWith('/admin/users')) return 'Athletes & Users Directory';
    if (pathname === '/admin/products') return 'Products Inventory';
    if (pathname === '/admin/products/add') return 'Add New Product';
    if (pathname.includes('/edit')) return 'Edit Product';
    if (pathname.startsWith('/admin/orders')) return 'Customer Orders';
    if (pathname.startsWith('/admin/categories')) return 'Categories & Catalog';
    return 'Admin Panel';
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleBell = () => {
    setIsDropdownOpen((prev) => !prev);
    requestNotificationPermission();
  };

  const badgeText = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <header className="sticky top-0 z-30 h-20 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between px-4 sm:px-8">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
          className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-900 border border-neutral-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-headline tracking-wide text-white">
            {getPageTitle()}
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-red-500 font-medium capitalize">
              {pathname.split('/')[2] || 'Overview'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Actions & Notification Bell */}
      <div className="flex items-center gap-3">
        {/* Real-time Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleToggleBell}
            aria-label="View notifications"
            className="relative p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition group"
          >
            <Bell className={`w-5 h-5 transition-transform ${unreadCount > 0 ? 'text-red-400 animate-pulse' : 'text-neutral-400'}`} />

            {/* Notification Count Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-neutral-950 shadow-lg shadow-red-900/60 animate-bounce">
                {badgeText}
              </span>
            )}
          </button>

          {/* Flyout Notification Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-neutral-950/95 border border-neutral-800 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-headline">
                    Live Alerts
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-900">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 6).map((item) => (
                    <div
                      key={item._id}
                      onClick={() => markAsRead(item._id)}
                      className={`p-3.5 hover:bg-neutral-900/50 transition cursor-pointer flex items-start gap-3 ${
                        !item.read ? 'bg-red-950/10' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          item.type === 'new_order'
                            ? 'bg-red-600/20 text-red-500'
                            : 'bg-emerald-600/20 text-emerald-400'
                        }`}
                      >
                        {item.type === 'new_order' ? (
                          <ShoppingBag className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">
                            {item.title}
                          </p>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-300 mt-0.5 line-clamp-2">
                          {item.message}
                        </p>
                        <span className="text-[10px] text-neutral-500 mt-1 block">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* View All Footer */}
              <div className="p-3 border-t border-neutral-800 bg-neutral-900/60 text-center">
                <Link
                  href="/admin/notifications"
                  onClick={() => setIsDropdownOpen(false)}
                  className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 transition"
                >
                  <span>Open Notification Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Live Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 text-red-500" />
          <span>Live Store</span>
        </Link>

        {/* Admin Tag */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
          <div className="w-6 h-6 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
            <UserIcon className="w-3.5 h-3.5" />
          </div>
          <div className="hidden md:block text-left">
            <p className="font-semibold text-neutral-200 leading-tight">
              {user?.name || 'Administrator'}
            </p>
            <span className="text-[10px] text-emerald-400 font-medium">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
