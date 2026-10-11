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
  Flame,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin' && (!redirectUrl || redirectUrl === '/')) {
        router.push('/admin');
      } else {
        router.push(redirectUrl);
      }
    }
  }, [isAuthenticated, user, redirectUrl, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim());

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
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto">
      {/* Desktop Light Highlight Glow / Aura around the Box Model */}
      <div className="hidden md:block absolute -inset-2 bg-gradient-to-b from-red-600/15 via-neutral-300/40 to-neutral-400/20 rounded-[28px] blur-xl -z-10 pointer-events-none" />

      {/* Main Box Model Card */}
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 md:border-neutral-300 md:ring-1 md:ring-neutral-900/10 md:shadow-[0_24px_65px_-12px_rgba(0,0,0,0.16),0_10px_28px_-6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] shadow-[0_20px_50px_-10px_rgba(220,38,38,0.1),0_10px_30px_-5px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 relative z-10">
        {/* Top Accent Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-neutral-950 to-red-600" />

      <div className="p-4 sm:p-7 space-y-3 sm:space-y-4">
        {/* Interactive Top Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl text-xs font-headline font-black uppercase tracking-wider">
          <span className="py-2 px-3 text-center bg-white text-neutral-950 rounded-lg shadow-xs flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" />
            Sign In
          </span>
          <Link
            href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="py-2 px-3 text-center text-neutral-500 hover:text-neutral-950 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            Create Account
          </Link>
        </div>

        {/* Header Title */}
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black font-headline tracking-tight uppercase text-neutral-950">
            Welcome Back
          </h1>
          <p className="text-xs text-neutral-500 leading-snug">
            Enter your credentials to manage your athletic orders & gear.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded-r-xl flex items-start gap-2 text-red-700 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {/* Email Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                Email Address <span className="text-red-600">*</span>
              </label>
              {isEmailValid && (
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              )}
            </div>
            <div
              className={`relative rounded-xl border transition-all duration-200 ${
                focusedField === 'email'
                  ? 'border-red-600 ring-4 ring-red-600/10 bg-white shadow-xs'
                  : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50'
              }`}
            >
              <div
                className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                  focusedField === 'email' ? 'text-red-600' : 'text-neutral-400'
                }`}
              >
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                placeholder="athlete@domain.com"
                value={formData.email}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                onChange={handleChange}
                className="w-full h-12 sm:h-13 pl-10 pr-3.5 bg-transparent rounded-xl text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                Password <span className="text-red-600">*</span>
              </label>
              <Link
                href={`/forgot-password${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                className="text-xs text-neutral-500 hover:text-red-600 font-bold transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div
              className={`relative rounded-xl border transition-all duration-200 ${
                focusedField === 'password'
                  ? 'border-red-600 ring-4 ring-red-600/10 bg-white shadow-xs'
                  : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50'
              }`}
            >
              <div
                className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                  focusedField === 'password' ? 'text-red-600' : 'text-neutral-400'
                }`}
              >
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                onChange={handleChange}
                className="w-full h-12 sm:h-13 pl-10 pr-11 bg-transparent rounded-xl text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-red-600 focus:ring-red-600/20 cursor-pointer accent-red-600"
              />
              <span>Keep me signed in</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 sm:h-13 bg-neutral-950 hover:bg-red-600 active:scale-[0.99] text-white font-headline text-sm font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-red-600/25 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group mt-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>SIGNING IN...</span>
              </>
            ) : (
              <>
                <span>SIGN IN TO ACCOUNT</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer / Switch Section */}
        <div className="pt-2 sm:pt-3 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-600 font-medium">
            New to SportXWear?{' '}
            <Link
              href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="font-black text-red-600 hover:text-red-700 underline underline-offset-2 ml-1"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-white via-neutral-50 to-red-50/50 md:from-neutral-100 md:via-neutral-50/70 md:to-neutral-100 flex flex-col justify-between selection:bg-red-600 selection:text-white z-50">
      {/* Dynamic Bright Ambient Background Glows */}
      <div className="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-br from-red-500/12 via-orange-400/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-red-600/10 via-rose-300/12 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-neutral-200/90 shadow-2xs shrink-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <span className="font-headline text-2xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase italic text-neutral-950 flex items-center transition-transform group-hover:scale-[1.02]">
              SPORT <span className="text-red-600 px-1 sm:px-1.5 transform -skew-x-12 inline-block">X</span> WEAR
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs font-headline font-black uppercase tracking-wider text-neutral-600 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            Storefront &rarr;
          </Link>
        </div>
      </header>

      {/* Main Container - Centered within fixed viewport with zero scrolling */}
      <main className="flex-1 flex justify-center items-center px-3.5 sm:px-4 py-2 overflow-hidden relative z-10">
        <Suspense
          fallback={
            <div className="p-6 text-center bg-white rounded-2xl border border-neutral-200 max-w-xs mx-auto shadow-md">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mt-2">Loading SportX...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      {/* Bottom Footer Note */}
      <footer className="py-2 text-center text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-widest font-semibold shrink-0 relative z-10">
        SPORT X WEAR &bull; BUILT FOR CHAMPIONS
      </footer>
    </div>
  );
}
