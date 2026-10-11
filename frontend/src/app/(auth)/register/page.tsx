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
  ArrowLeft,
  ShieldCheck,
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
      setError('Please provide a valid email format (e.g. athlete@domain.com).');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
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
    <div className="w-full max-w-lg mx-auto">
      {/* Mobile & Desktop Card Wrapper */}
      <div className="w-full bg-neutral-900/90 sm:border sm:border-neutral-800 rounded-3xl sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl relative">
        {/* Accent Top Border */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

        <div className="p-5 sm:p-8 space-y-6">
          {/* Segmented Tab Switcher (Step 1 only) */}
          {step === 1 && (
            <div className="grid grid-cols-2 p-1.5 bg-neutral-950 border border-neutral-800/80 rounded-2xl text-xs sm:text-sm font-headline font-black uppercase tracking-wider">
              <Link
                href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                className="py-2.5 px-4 text-center text-neutral-400 hover:text-white rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 text-neutral-500" />
                Sign In
              </Link>
              <span className="py-2.5 px-4 text-center bg-red-600 text-white rounded-xl shadow-md shadow-red-950/40 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 fill-white" />
                Create Account
              </span>
            </div>
          )}

          {/* Heading */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {step === 1 ? 'New Athlete Membership' : 'Security Verification'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-headline tracking-wide text-white uppercase pt-1">
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              {step === 1
                ? 'Join SPORT X WEAR to access championship-grade athletic gear and telemetry.'
                : `We dispatched a 6-digit verification code to ${formData.email}.`}
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-950/70 border border-red-800 text-red-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-snug">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-snug">{successMsg}</p>
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === 1 ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 sm:space-y-5" noValidate>
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-headline block mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative rounded-2xl border transition-all duration-200 ${
                    focusedField === 'name'
                      ? 'border-red-500 ring-4 ring-red-500/15 bg-neutral-950'
                      : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                  }`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                      focusedField === 'name' ? 'text-red-500' : 'text-neutral-500'
                    }`}
                  >
                    <UserIcon className="w-5 h-5" />
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
                    className="w-full h-14 pl-12 pr-4 bg-transparent rounded-2xl text-base text-white placeholder:text-neutral-500 outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-headline flex items-center gap-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  {isEmailValid && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Valid
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
                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
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

              {/* Phone Number (Optional) */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-headline block mb-2">
                  Phone Number <span className="text-neutral-500 font-normal lowercase">(optional)</span>
                </label>
                <div
                  className={`relative rounded-2xl border transition-all duration-200 ${
                    focusedField === 'phone'
                      ? 'border-red-500 ring-4 ring-red-500/15 bg-neutral-950'
                      : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                  }`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                      focusedField === 'phone' ? 'text-red-500' : 'text-neutral-500'
                    }`}
                  >
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                    className="w-full h-14 pl-12 pr-4 bg-transparent rounded-2xl text-base text-white placeholder:text-neutral-500 outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-headline flex items-center gap-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  {isPasswordLongEnough && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> 6+ chars
                    </span>
                  )}
                </div>
                <div
                  className={`relative rounded-2xl border transition-all duration-200 ${
                    focusedField === 'password'
                      ? 'border-red-500 ring-4 ring-red-500/15 bg-neutral-950'
                      : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                  }`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                      focusedField === 'password' ? 'text-red-500' : 'text-neutral-500'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="At least 6 characters"
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
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-headline flex items-center gap-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  {doPasswordsMatch && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Matches
                    </span>
                  )}
                </div>
                <div
                  className={`relative rounded-2xl border transition-all duration-200 ${
                    focusedField === 'confirmPassword'
                      ? 'border-red-500 ring-4 ring-red-500/15 bg-neutral-950'
                      : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                  }`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                      focusedField === 'confirmPassword' ? 'text-red-500' : 'text-neutral-500'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    onChange={handleChange}
                    className="w-full h-14 pl-12 pr-12 bg-transparent rounded-2xl text-base text-white placeholder:text-neutral-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    aria-label="Toggle confirm password"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-red-500 active:scale-[0.99] text-white font-headline text-base sm:text-lg font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.35)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group mt-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>DISPATCHING CODE...</span>
                  </>
                ) : (
                  <>
                    <span>CONTINUE TO VERIFY</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: OTP Verification */
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              {/* 6 Digit Inputs */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-headline block text-center mb-4">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-3.5">
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
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black font-headline bg-neutral-950 border border-neutral-800 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 text-white rounded-2xl outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full h-14 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-red-500 active:scale-[0.99] text-white font-headline text-base sm:text-lg font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.35)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>ACTIVATING ACCOUNT...</span>
                  </>
                ) : (
                  <>
                    <span>VERIFY & ACTIVATE</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Resend & Edit Details */}
              <div className="pt-2 flex items-center justify-between text-xs text-neutral-400">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                  className="font-bold hover:text-white transition flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit details</span>
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || isResending}
                  onClick={handleResendOtp}
                  className="font-bold text-red-400 hover:text-red-300 disabled:text-neutral-600 disabled:cursor-not-allowed transition"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-neutral-800/80 text-center">
            <p className="text-xs sm:text-sm text-neutral-400 font-medium">
              Already have an athlete account?{' '}
              <Link
                href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                className="font-bold text-red-400 hover:text-red-300 underline underline-offset-4 ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
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

      {/* Main Container - Full viewport height on mobile, generous padding */}
      <main className="flex-1 flex justify-center items-center px-4 sm:px-6 py-6 sm:py-12 relative z-10">
        <Suspense
          fallback={
            <div className="p-8 text-center bg-neutral-900 rounded-3xl border border-neutral-800 max-w-xs mx-auto shadow-xl">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mt-3">Loading SportX...</p>
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-neutral-500 uppercase tracking-widest font-semibold shrink-0 relative z-10 border-t border-neutral-900">
        SPORT X WEAR &bull; BUILT FOR CHAMPIONS
      </footer>
    </div>
  );
}
