'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  FolderTree,
  ExternalLink,
  LogOut,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: Package,
      exact: false,
    },
    {
      name: 'Add Product',
      href: '/admin/products/add',
      icon: PlusCircle,
      exact: true,
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      exact: false,
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: FolderTree,
      exact: false,
    },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href) && href !== '/admin';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header / Branding */}
        <div className="h-20 px-6 border-b border-neutral-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center font-headline font-black text-white text-xl tracking-wider shadow-lg shadow-red-900/40">
              SX
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-black text-xl text-white tracking-wider">
                  SPORT<span className="text-red-500">X</span>WEAR
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                  Admin Panel
                </span>
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Main Management
          </div>

          {navigation.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  active
                    ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-900/30'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      active ? 'text-white' : 'text-neutral-400 group-hover:text-red-500'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {active && <ChevronRight className="w-4 h-4 text-white/80" />}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Storefront
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all group"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-neutral-400 group-hover:text-red-500" />
              <span>Live Customer Store</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
              View
            </span>
          </Link>
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80">
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 text-red-500 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {user?.email || 'admin@sportxwear.com'}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Logout"
              className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
