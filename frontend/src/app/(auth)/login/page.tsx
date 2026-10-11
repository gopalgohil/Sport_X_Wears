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
  ArrowLeft,
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
    <div className="w-full max-w-lg mx-auto">
      {/* Mobile & Desktop Card Wrapper */}
      <div className="w-full bg-neutral-900/90 sm:border sm:border-neutral-800 rounded-3xl sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl relative">
        {/* Athletic Accent Top Border */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

        <div className="p-5 sm:p-8 space-y-6">
          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-neutral-950 border border-neutral-800/80 rounded-2xl text-xs sm:text-sm font-headline font-black uppercase tracking-wider">
            <span className="py-2.5 px-4 text-center bg-red-600 text-white rounded-xl shadow-md shadow-red-950/40 flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 fill-white" />
              Sign In
            </span>
            <Link
              href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="py-2.5 px-4 text-center text-neutral-400 hover:text-white rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-neutral-500" />
              Create Account
            </Link>
          </div>

          {/* Heading Section */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Athlete Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-headline tracking-wide text-white uppercase pt-1">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Enter your credentials to manage your gear, orders, and elite training telemetry.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-950/70 border border-red-800 text-red-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-snug">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-headline flex items-center gap-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                {isEmailValid && (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                  </span>
                )}
              </div>
              <div
                className={`relative rounded-2xl border transition-all duration-200 ${
                  focusedField === 'email'
                    ? 'border-red-500 ring-4 ring-red-500/15 bg-neutral-950'
                    : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                    focusedField === 'email' ? 'text-red-500' : 'text-neutral-500'
                  }`}
                >
                  <Mail className="w-5 h-5" />
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
                  className="w-full h-14 pl-12 pr-4 bg-transparent rounded-2xl text-base text-white placeholder:text-neutral-500 outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-headline flex items-center gap-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  href={`/forgot-password${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                  className="text-xs text-neutral-400 hover:text-red-400 font-bold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div
                className={`relative rounded-2xl border transition-all duration-200 ${
                  focusedField === 'password'
                    ? 'border-red-500 ring-4 ring-red-500/15 bg-neutral-950'
                    : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                    focusedField === 'password' ? 'text-red-500' : 'text-neutral-500'
                  }`}
                >
                  <Lock className="w-5 h-5" />
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
                  className="w-full h-14 pl-12 pr-12 bg-transparent rounded-2xl text-base text-white placeholder:text-neutral-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-white transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-neutral-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600/30 cursor-pointer accent-red-600"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* High-Impact CTA Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-red-500 active:scale-[0.99] text-white font-headline text-base sm:text-lg font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.35)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN TO ACCOUNT</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer / Switch Section */}
          <div className="pt-4 border-t border-neutral-800/80 text-center">
            <p className="text-xs sm:text-sm text-neutral-400 font-medium">
              Don't have an athlete account yet?{' '}
              <Link
                href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                className="font-bold text-red-400 hover:text-red-300 underline underline-offset-4 ml-1"
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
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col justify-between selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Ambient Background Highlights */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80 shrink-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <span className="font-headline text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-white flex items-center">
              SPORT <span className="text-red-600 px-1 transform -skew-x-12 inline-block">X</span> WEAR
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs sm:text-sm font-headline font-bold uppercase tracking-wider text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Store</span>
          </Link>
        </div>
      </header>

      {/* Main Container - Full viewport height on mobile, comfortable padding */}
      <main className="flex-1 flex justify-center items-center px-4 sm:px-6 py-6 sm:py-12 relative z-10">
        <Suspense
          fallback={
            <div className="p-8 text-center bg-neutral-900 rounded-3xl border border-neutral-800 max-w-xs mx-auto shadow-xl">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mt-3">Loading SportX...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-neutral-500 uppercase tracking-widest font-semibold shrink-0 relative z-10 border-t border-neutral-900">
        SPORT X WEAR &bull; BUILT FOR CHAMPIONS
      </footer>
    </div>
  );
}
