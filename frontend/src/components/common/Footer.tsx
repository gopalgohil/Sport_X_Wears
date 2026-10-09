'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
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
                JOIN THE ATHLETE SQUAD (GET 15% OFF)
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Enter athlete email address..."
                  className="bg-white border border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-600 flex-1 shadow-xs"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 font-headline text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                >
                  JOIN <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Column 1: Gear */}
          <div>
            <h5 className="font-headline text-base font-bold uppercase tracking-wider text-neutral-950 mb-4">
              COLLECTIONS
            </h5>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li><a href="#products-section" className="hover:text-red-600 transition-colors">Pro-Vent T-Shirts</a></li>
              <li><a href="#products-section" className="hover:text-red-600 transition-colors">Velocity Track Pants</a></li>
              <li><a href="#products-section" className="hover:text-red-600 transition-colors">Laser-Cut Sports Caps</a></li>
              <li><a href="#products-section" className="hover:text-red-600 transition-colors">Compression Gear</a></li>
              <li><a href="#products-section" className="hover:text-red-600 transition-colors">New Releases</a></li>
            </ul>
          </div>

          {/* Column 2: Technology */}
          <div>
            <h5 className="font-headline text-base font-bold uppercase tracking-wider text-neutral-950 mb-4">
              INNOVATION
            </h5>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li><a href="#products-section" className="hover:text-red-600 transition-colors">AeroVent™ Mesh</a></li>
              <li><a href="#products-section" className="hover:text-red-600 transition-colors">ThermoFlex™ Weave</a></li>
              <li><a href="#products-section" className="hover:text-red-600 transition-colors">DuraShield™ Coating</a></li>
              <li><a href="#products-section" className="hover:text-red-600 transition-colors">Athletic Lab Testing</a></li>
              <li><a href="#products-section" className="hover:text-red-600 transition-colors">Sustainable Fibers</a></li>
            </ul>
          </div>

          {/* Column 3: Athlete Support */}
          <div>
            <h5 className="font-headline text-base font-bold uppercase tracking-wider text-neutral-950 mb-4">
              SUPPORT
            </h5>
            <ul className="space-y-2.5 text-sm text-neutral-600">
              <li><span className="hover:text-red-600 transition-colors cursor-pointer">Order Tracking</span></li>
              <li><span className="hover:text-red-600 transition-colors cursor-pointer">Size Guide & Fit</span></li>
              <li><span className="hover:text-red-600 transition-colors cursor-pointer">Shipping & Customs</span></li>
              <li><span className="hover:text-red-600 transition-colors cursor-pointer">Sweat Trial Returns</span></li>
              <li><span className="hover:text-red-600 transition-colors cursor-pointer">Contact Athletes Desk</span></li>
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
