'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  Flame,
  Sparkles,
  Check,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { register, verifyOtp, resendOtp, isAuthenticated } = useAuth();

  // Registration Step: 1 = Details, 2 = 6-digit OTP Verification
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, redirectUrl, router]);

  // Resend cooldown timer for Step 2
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processed = value;
    if (name === 'phone') {
      processed = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [name]: processed }));
    setError('');
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim());
  const isPasswordLongEnough = formData.password.length >= 6;
  const doPasswordsMatch =
    formData.password.length > 0 && formData.password === formData.confirmPassword;

  // Step 1: Submit Details & Request OTP via Brevo
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!isEmailValid) {
      setError('Please provide a valid email format.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      setStep(2);
      setResendCooldown(60);
      setSuccessMsg(res.message || 'Verification code sent to your email.');

      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Box Inputs Handlers
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);
    setError('');

    if (cleanVal && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const nextFocus = Math.min(pastedData.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp({
        email: formData.email.trim(),
        otp: fullCode,
      });
      router.push(redirectUrl);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP via Brevo
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await resendOtp(formData.email.trim());
      setResendCooldown(60);
      setSuccessMsg(res.message || 'New verification code sent!');
      setOtp(['', '', '', '', '', '']);
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-[0_20px_50px_-10px_rgba(220,38,38,0.1),0_10px_30px_-5px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 relative z-10 backdrop-blur-sm">
      {/* Top Accent Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-neutral-950 to-red-600" />

      <div className="p-3.5 sm:p-6 space-y-2.5 sm:space-y-3.5">
        {/* Interactive Top Tab Switcher */}
        {step === 1 && (
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl text-xs font-headline font-black uppercase tracking-wider">
            <Link
              href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="py-1.5 sm:py-2 px-3 text-center text-neutral-500 hover:text-neutral-950 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-neutral-400" />
              Sign In
            </Link>
            <span className="py-1.5 sm:py-2 px-3 text-center bg-white text-neutral-950 rounded-lg shadow-xs flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              Create Account
            </span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-0.5">
          <h1 className="text-lg sm:text-2xl font-black font-headline tracking-tight uppercase text-neutral-950">
            {step === 1 ? 'Create Account' : 'Verify Email'}
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-500 line-clamp-1 leading-snug">
            {step === 1
              ? 'Join SPORT X WEAR to access championship athletic gear.'
              : `Enter 6-digit code sent to ${formData.email}`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-2 sm:p-2.5 bg-red-50 border-l-4 border-red-600 rounded-r-xl flex items-start gap-2 text-red-700 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-2 sm:p-2.5 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl flex items-start gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-2 sm:space-y-2.5" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-0.5">
                Full Name <span className="text-red-600">*</span>
              </label>
              <div
                className={`relative rounded-xl border transition-all ${
                  focusedField === 'name'
                    ? 'border-red-600 ring-4 ring-red-600/10 bg-white shadow-xs'
                    : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50'
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    focusedField === 'name' ? 'text-red-600' : 'text-neutral-400'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Alex Hunter"
                  value={formData.name}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                  className="w-full h-11 sm:h-12 pl-9 pr-3 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Email Address <span className="text-red-600">*</span>
                </label>
                {isEmailValid && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid
                  </span>
                )}
              </div>
              <div
                className={`relative rounded-xl border transition-all ${
                  focusedField === 'email'
                    ? 'border-red-600 ring-4 ring-red-600/10 bg-white shadow-xs'
                    : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50'
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
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
                  className="w-full h-11 sm:h-12 pl-9 pr-3 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>

            {/* 2-Column Grid: Password & Confirm Password (Saves vertical space, no scroll!) */}
            <div className="grid grid-cols-2 gap-2">
              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-0.5 truncate">
                  Password <span className="text-red-600">*</span>
                </label>
                <div
                  className={`relative rounded-xl border transition-all ${
                    focusedField === 'password'
                      ? 'border-red-600 ring-4 ring-red-600/10 bg-white shadow-xs'
                      : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="6+ chars"
                    value={formData.password}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                    className="w-full h-11 sm:h-12 pl-3 pr-8 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-800"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-0.5 truncate">
                  Confirm <span className="text-red-600">*</span>
                </label>
                <div
                  className={`relative rounded-xl border transition-all ${
                    focusedField === 'confirmPassword'
                      ? 'border-red-600 ring-4 ring-red-600/10 bg-white shadow-xs'
                      : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    placeholder="Repeat"
                    value={formData.confirmPassword}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                    className="w-full h-11 sm:h-12 pl-3 pr-8 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-800"
                    aria-label="Toggle confirm"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-0.5">
                Mobile Number (optional)
              </label>
              <div
                className={`relative rounded-xl border transition-all ${
                  focusedField === 'phone'
                    ? 'border-red-600 ring-4 ring-red-600/10 bg-white shadow-xs'
                    : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50'
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    focusedField === 'phone' ? 'text-red-600' : 'text-neutral-400'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit number"
                  value={formData.phone}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                  className="w-full h-11 sm:h-12 pl-9 pr-3 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 bg-neutral-950 hover:bg-red-600 active:scale-[0.99] text-white font-headline text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:shadow-red-600/25 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>DISPATCHING CODE...</span>
                </>
              ) : (
                <>
                  <span>CREATE ACCOUNT & VERIFY</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP Verification */
          <form onSubmit={handleVerifySubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 font-headline block text-center mb-3">
                Enter 6-Digit Verification Code
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 sm:w-13 h-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-headline bg-neutral-50 border border-neutral-300 focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 text-neutral-950 rounded-xl outline-none transition-all shadow-xs"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full h-12 sm:h-13 bg-neutral-950 hover:bg-red-600 active:scale-[0.99] text-white font-headline text-sm font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>ACTIVATING ACCOUNT...</span>
                </>
              ) : (
                <>
                  <span>VERIFY & ACTIVATE</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="pt-1 flex items-center justify-between text-xs text-neutral-500">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError('');
                }}
                className="font-bold hover:text-neutral-950 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit details</span>
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || isResending}
                onClick={handleResendOtp}
                className="font-bold text-red-600 hover:text-red-700 disabled:text-neutral-400 disabled:cursor-not-allowed transition"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* Footer Switch */}
        <div className="pt-2 sm:pt-3 border-t border-neutral-100 text-center">
          <p className="text-xs text-neutral-600 font-medium">
            Already have an account?{' '}
            <Link
              href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="font-black text-red-600 hover:text-red-700 underline underline-offset-2 ml-1"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-white via-neutral-50 to-red-50/50 flex flex-col justify-between selection:bg-red-600 selection:text-white z-50">
      {/* Background Accent Glows */}
      <div className="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-br from-red-500/12 via-orange-400/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-red-600/10 via-rose-300/12 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-neutral-200/90 shadow-2xs shrink-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 sm:h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <span className="font-headline text-lg sm:text-xl font-black tracking-tighter uppercase italic text-neutral-950 flex items-center">
              SPORT <span className="text-red-600 px-0.5 sm:px-1 transform -skew-x-12 inline-block">X</span> WEAR
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

      {/* Main Form Container - Centered within fixed viewport with zero scrolling */}
      <main className="flex-1 flex justify-center items-center px-3.5 sm:px-4 py-2 overflow-hidden relative z-10">
        <Suspense
          fallback={
            <div className="p-6 text-center bg-white rounded-2xl border border-neutral-200 max-w-xs mx-auto shadow-md">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mt-2">Loading SportX...</p>
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </main>

      {/* Bottom Footer Note */}
      <footer className="py-2 text-center text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-widest font-semibold shrink-0 relative z-10">
        SPORT X WEAR &bull; BUILT FOR CHAMPIONS
      </footer>
    </div>
  );
}
