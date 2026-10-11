'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ExternalLink, ShieldAlert, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard Overview';
    if (pathname === '/admin/products') return 'Products Inventory';
    if (pathname === '/admin/products/add') return 'Add New Product';
    if (pathname.includes('/edit')) return 'Edit Product';
    if (pathname.startsWith('/admin/orders')) return 'Customer Orders';
    if (pathname.startsWith('/admin/categories')) return 'Categories & Catalog';
    return 'Admin Panel';
  };

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

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-3">
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
