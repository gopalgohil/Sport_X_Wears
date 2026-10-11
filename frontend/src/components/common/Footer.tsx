'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCategories } from '../../lib/api';
import { Category } from '../../types';

export const Footer: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (e) {
        console.error('Footer category fetch error', e);
      }
    }
    loadCats();
  }, []);

  return (
    <footer className="bg-neutral-50 text-neutral-900 border-t border-neutral-200 pt-12 pb-12">
      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-headline text-3xl font-extrabold tracking-tighter uppercase italic text-neutral-950 flex items-center">
                SPORT <span className="text-red-600 px-1 transform -skew-x-12 inline-block">X</span> WEAR
              </span>
            </Link>
            <p className="text-sm text-neutral-600 max-w-sm leading-relaxed">
              Engineered with AeroVent™ hyper-cooling fabrics and zero-abrasion seam technology. Tested by elite athletes for uncompromising endurance.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <p className="font-headline text-sm font-bold uppercase tracking-wider text-neutral-800 mb-2">
                SUBSCRIBE FOR EXCLUSIVE OFFERS & DROPS
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  className="bg-white border border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-600 flex-1 shadow-xs"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 font-headline text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                >
                  SUBSCRIBE <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Column 1: Dynamic Collections */}
          <div>
            <h5 className="font-headline text-base font-bold uppercase tracking-wider text-neutral-950 mb-4">
              COLLECTIONS
            </h5>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat._id}>
                    <Link
                      href={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                      className="hover:text-red-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/products" className="hover:text-red-600 transition-colors">All Athletic Gear</Link></li>
                  <li><Link href="/products" className="hover:text-red-600 transition-colors">New Drops</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 2: Technology */}
          <div>
            <h5 className="font-headline text-base font-bold uppercase tracking-wider text-neutral-950 mb-4">
              ABOUT US
            </h5>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li><Link href="/products" className="hover:text-red-600 transition-colors">Our Story</Link></li>
              <li><Link href="/products" className="hover:text-red-600 transition-colors">Quality Assurance</Link></li>
              <li><Link href="/products" className="hover:text-red-600 transition-colors">Track Your Order</Link></li>
              <li><Link href="/products" className="hover:text-red-600 transition-colors">Shipping Policy</Link></li>
              <li><Link href="/products" className="hover:text-red-600 transition-colors">Return & Refund</Link></li>
            </ul>
          </div>

          {/* Column 3: Athlete Support */}
          <div>
            <h5 className="font-headline text-base font-bold uppercase tracking-wider text-neutral-950 mb-4">
              SUPPORT
            </h5>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li><Link href="/orders" className="hover:text-red-600 transition-colors">My Orders</Link></li>
              <li><Link href="/profile" className="hover:text-red-600 transition-colors">Saved Addresses</Link></li>
              <li><span className="hover:text-red-600 transition-colors cursor-pointer">Size Guide</span></li>
              <li><span className="hover:text-red-600 transition-colors cursor-pointer">7-Day Return Policy</span></li>
              <li><span className="hover:text-red-600 transition-colors cursor-pointer">Contact Support</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 SPORT X WEAR INC. ALL RIGHTS RESERVED. BUILT FOR CHAMPIONS.</p>
        <div className="flex gap-6">
          <span className="hover:text-neutral-900 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-neutral-900 cursor-pointer">Terms of Service</span>
          <span className="hover:text-neutral-900 cursor-pointer">Cookie Settings</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
