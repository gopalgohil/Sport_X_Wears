'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      router.push(redirectUrl);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.message || 'Invalid credentials. Please verify your email and password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-neutral-200/90 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.14),0_8px_20px_rgba(0,0,0,0.08)] overflow-hidden">
      {/* Simple Clean Header */}
      <div className="p-6 sm:p-8 pb-1 sm:pb-2 text-center">
        <h1 className="font-headline text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
          Sign In
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Enter your email and password to access your account.
        </p>
      </div>

      {/* Form Body - Compact & Perfectly Spaced */}
      <div className="p-6 sm:p-8 pt-3 sm:pt-4 space-y-4">
        {error && (
          <div className="p-3.5 bg-red-50 border-l-4 border-red-600 rounded-sm flex items-start gap-2.5 text-red-700 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email field */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                placeholder="athlete@domain.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3.5 py-3 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors shadow-xs"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-700">
                Password
              </label>
              <span className="text-[11px] text-neutral-400 hover:text-red-600 cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-11 py-3 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neutral-950 hover:bg-red-600 text-white font-headline text-sm font-extrabold uppercase tracking-wider py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                SIGNING IN...
              </>
            ) : (
              <>
                SIGN IN <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Register - Right below the button */}
        <div className="text-center pt-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-600">
            Don't have an athlete account yet?{' '}
            <Link
              href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="font-bold text-red-600 hover:text-red-700 underline underline-offset-2 ml-1"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#eae7df] flex flex-col justify-center items-center py-6 sm:py-10 px-3.5 sm:px-6">
      {/* Shifted Upwards Wrapper */}
      <div className="w-full max-w-md -translate-y-4 sm:-translate-y-10">
        {/* Brand Header */}
        <div className="text-center mb-4 sm:mb-6">
          <Link href="/" className="inline-block group">
            <span className="font-headline text-2xl sm:text-4xl font-black tracking-tighter uppercase italic text-neutral-950 flex items-center justify-center">
              SPORT <span className="text-red-600 px-1 transform -skew-x-12 inline-block">X</span> WEAR
            </span>
          </Link>
        </div>

        {/* Main Login Card */}
        <div className="flex justify-center items-center w-full">
          <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-600" /></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
