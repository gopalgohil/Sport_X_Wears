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
  RotateCcw,
  KeyRound,
  Flame,
  Sparkles,
  Check,
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

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      setError('Please provide a valid 10-digit mobile number starting with 6-9.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (res.requiresVerification) {
        setStep(2);
        setResendCooldown(60);
        setSuccessMsg(res.message || `Verification code sent to ${formData.email}.`);
        setTimeout(() => {
          otpInputsRef.current[0]?.focus();
        }, 150);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.message || 'Registration failed. An account with this email may already exist.'
      );
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

    // Auto-advance to next box
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

      <div className="p-3 sm:p-6 space-y-2 sm:space-y-3">
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

        {/* Step Header */}
        <div>
          {step === 1 ? (
            <div>
              <h1 className="font-headline text-xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
                CREATE ACCOUNT
              </h1>
              <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5">
                Sign up for fast checkout and order tracking.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-9 h-9 mx-auto bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center justify-center mb-1 shadow-xs">
                <KeyRound className="w-4 h-4" />
              </div>
              <h1 className="font-headline text-lg sm:text-2xl font-black uppercase tracking-tight text-neutral-950">
                VERIFY EMAIL CODE
              </h1>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                Enter code sent to <strong className="text-neutral-950 font-bold">{formData.email}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-2 bg-red-50/95 border-l-4 border-red-600 rounded-r-lg flex items-start gap-2 text-red-700 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600 mt-0.5" />
            <span className="flex-1 leading-tight">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-2 bg-emerald-50/95 border-l-4 border-emerald-600 rounded-r-lg flex items-start gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 mt-0.5" />
            <span className="flex-1 leading-tight">{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-2 sm:space-y-2.5" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-0.5">
                Full Name <span className="text-red-600">*</span>
              </label>
              <div
                className={`relative rounded-xl border transition-all duration-200 ${
                  focusedField === 'name'
                    ? 'border-red-600 ring-4 ring-red-600/10 bg-white shadow-xs'
                    : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50'
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                    focusedField === 'name' ? 'text-red-600' : 'text-neutral-400'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rohit Verma"
                  value={formData.name}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Email Address <span className="text-red-600">*</span>
                </label>
                {isEmailValid && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Valid
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
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@domain.com"
                  value={formData.email}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-0.5">
                Mobile Number <span className="text-neutral-400 font-normal lowercase">(optional)</span>
              </label>
              <div
                className={`flex rounded-xl border overflow-hidden transition-all duration-200 ${
                  focusedField === 'phone'
                    ? 'border-red-600 ring-4 ring-red-600/10 bg-white shadow-xs'
                    : 'border-neutral-300 bg-neutral-50/70'
                }`}
              >
                <span className="inline-flex items-center px-2.5 bg-neutral-100 border-r border-neutral-300 text-xs font-bold text-neutral-700">
                  +91
                </span>
                <div className="relative flex-1">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                      focusedField === 'phone' ? 'text-red-600' : 'text-neutral-400'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-transparent text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Password <span className="text-red-600">*</span>
                </label>
                <span
                  className={`text-[10px] font-bold flex items-center gap-1 ${
                    isPasswordLongEnough ? 'text-emerald-600' : 'text-neutral-400'
                  }`}
                >
                  {isPasswordLongEnough && <Check className="w-3 h-3" />} Min 6 chars
                </span>
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
                  <Lock className="w-3.5 h-3.5" />
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
                  className="w-full pl-9 pr-9 py-1.5 sm:py-2 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Confirm Password <span className="text-red-600">*</span>
                </label>
                {formData.confirmPassword.length > 0 && (
                  <span
                    className={`text-[10px] font-bold flex items-center gap-1 ${
                      doPasswordsMatch ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {doPasswordsMatch ? '✓ Matches' : 'Must match'}
                  </span>
                )}
              </div>
              <div
                className={`relative rounded-xl border transition-all duration-200 ${
                  focusedField === 'confirmPassword'
                    ? 'border-red-600 ring-4 ring-red-600/10 bg-white shadow-xs'
                    : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50'
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                    focusedField === 'confirmPassword' ? 'text-red-600' : 'text-neutral-400'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleChange}
                  className="w-full pl-9 pr-9 py-1.5 sm:py-2 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neutral-950 hover:bg-red-600 active:scale-[0.98] text-white font-headline text-xs sm:text-sm font-black uppercase tracking-wider py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-red-600/25 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group mt-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>SENDING CODE...</span>
                </>
              ) : (
                <>
                  <span>CONTINUE &amp; VERIFY</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: 6-Digit OTP Box Model */
          <form onSubmit={handleVerifySubmit} className="space-y-3 pt-0.5" noValidate>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5 text-center">
                ENTER 6-DIGIT CODE
              </label>
              <div className="flex justify-between gap-1.5 max-w-xs mx-auto">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    className="w-10 sm:w-12 h-11 sm:h-13 text-center font-headline text-xl sm:text-2xl font-black border-2 border-neutral-300 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/10 focus:outline-none transition-all shadow-xs bg-white text-neutral-950"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-neutral-950 hover:bg-red-600 active:scale-[0.98] text-white font-headline text-xs sm:text-sm font-black uppercase tracking-wider py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>VERIFYING CODE...</span>
                </>
              ) : (
                <>
                  <span>ACTIVATE ACCOUNT</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Resend OTP Timer & Edit Email */}
            <div className="pt-0.5 text-center space-y-1">
              {resendCooldown > 0 ? (
                <p className="text-[11px] text-neutral-500 font-semibold">
                  Resend code in <span className="font-bold text-neutral-950">{resendCooldown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-2 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
              )}

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-[10px] text-neutral-500 hover:text-neutral-900 font-semibold underline underline-offset-2 cursor-pointer"
                >
                  &larr; Edit Details
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Footer Link to Login */}
        <div className="pt-2 border-t border-neutral-100 text-center">
          <p className="text-[11px] text-neutral-600">
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
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-white via-neutral-50 to-red-50/60 flex flex-col justify-between selection:bg-red-600 selection:text-white z-50">
      {/* Dynamic Bright Ambient Background Glows */}
      <div className="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-br from-red-500/15 via-orange-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-red-600/12 via-rose-300/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-neutral-200/90 shadow-2xs shrink-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 sm:h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <span className="font-headline text-lg sm:text-xl font-black tracking-tighter uppercase italic text-neutral-950 flex items-center">
              SPORT <span className="text-red-600 px-0.5 sm:px-1 transform -skew-x-12 inline-block">X</span> WEAR
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs font-headline font-black uppercase tracking-wider text-neutral-600 hover:text-red-600 transition-colors"
          >
            Storefront &rarr;
          </Link>
        </div>
      </header>

      {/* Main Register Box */}
      <main className="flex-1 flex justify-center items-center px-3 sm:px-4 py-1.5 overflow-hidden relative z-10">
        <Suspense
          fallback={
            <div className="p-5 text-center bg-white rounded-2xl border border-neutral-200 max-w-xs mx-auto shadow-md">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mt-1.5">Loading SportX...</p>
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </main>

      {/* Subtle bottom note */}
      <footer className="py-1.5 sm:py-2 text-center text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-widest font-semibold shrink-0 relative z-10">
        SPORT X WEAR &bull; BUILT FOR CHAMPIONS
      </footer>
    </div>
  );
}
