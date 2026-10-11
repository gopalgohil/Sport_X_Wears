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
} from 'lucide-react';

export default function AdminMobileNav() {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Overview',
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
      name: 'Add Gear',
      href: '/admin/products/add',
      icon: PlusCircle,
      exact: true,
      isSpecial: true,
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
    <nav
      aria-label="Admin Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800 shadow-[0_-4px_20px_rgba(0,0,0,0.6)] lg:hidden safe-area-bottom"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
        {navigation.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4 group"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                    active
                      ? 'bg-red-500 text-white shadow-red-900/60 ring-2 ring-red-400'
                      : 'bg-red-600 text-white shadow-red-900/40'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-500 mt-1">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                active ? 'text-red-500 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  active ? 'scale-110 text-red-500 stroke-[2.4]' : 'stroke-[1.8]'
                }`}
              />
              <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
