'use client';

import React, { useEffect } from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SignOutModal() {
  const { user, isLogoutModalOpen, cancelLogout, confirmLogout } = useAuth();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelLogout();
      }
    };

    if (isLogoutModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLogoutModalOpen, cancelLogout]);

  if (!isLogoutModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) cancelLogout();
      }}
    >
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-[0_25px_65px_-12px_rgba(0,0,0,0.25)] p-5 sm:p-6 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-neutral-900 to-red-600" />

        {/* Close Button */}
        <button
          onClick={cancelLogout}
          type="button"
          aria-label="Close"
          className="absolute top-3.5 right-3.5 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="text-center pt-2">
          {/* Warning Icon Badge */}
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
            <LogOut className="w-6 h-6 stroke-[2.2] translate-x-0.5" />
          </div>

          <h2
            id="signout-modal-title"
            className="font-headline text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 mb-1"
          >
            Sign Out Confirmation
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
            Are you sure you want to end your current session on <span className="font-bold text-neutral-900">SportXWear</span>?
          </p>

          {/* User Account Info Chip */}
          {user && (
            <div className="p-3 mb-5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-full bg-neutral-950 text-white font-headline font-black text-xs flex items-center justify-center shrink-0 border border-red-600">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'SX'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-neutral-950 truncate">{user.name}</p>
                <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-100 text-red-700 tracking-wider">
                {user.role === 'admin' ? 'Admin' : 'Athlete'}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={cancelLogout}
              className="w-full h-11 sm:h-12 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 font-headline font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmLogout}
              className="w-full h-11 sm:h-12 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-headline font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/30 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Yes, Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
