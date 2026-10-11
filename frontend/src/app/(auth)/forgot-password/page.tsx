'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
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
  CheckCircle2,
  RotateCcw,
  KeyRound,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { requestForgotPassword, submitResetPassword } from '../../../lib/api';

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  // Step 1 = Enter Email, Step 2 = Enter 6-digit OTP & New Password, Step 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

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

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const isPasswordLongEnough = newPassword.length >= 6;
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    if (!isEmailValid) {
      setError('Please provide a valid email format.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestForgotPassword(email.trim());
      setSuccessMsg(res.message || 'Verification code dispatched to your email.');
      setStep(2);
      setResendCooldown(60);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Handlers
  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);
    setError('');

    if (clean && index < 5) {
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
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pasteData.length, 5);
    otpInputsRef.current[nextIndex]?.focus();
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await requestForgotPassword(email.trim());
      setSuccessMsg(res.message || `A fresh 6-digit code has been sent to ${email.trim()}.`);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  // Step 2: Submit Reset Password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await submitResetPassword({
        email: email.trim(),
        otp: otpCode,
        password: newPassword,
      });

      if (res.success) {
        setStep(3);
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email.trim())}`);
        }, 2500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your OTP code.');
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
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-neutral-950 to-red-600" />

      <div className="p-4 sm:p-7 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="space-y-1 text-center">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-1.5 shadow-xs">
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="font-headline text-lg sm:text-2xl font-black uppercase tracking-tight text-neutral-950">
            {step === 1 ? 'FORGOT PASSWORD' : step === 2 ? 'RESET PASSWORD' : 'PASSWORD UPDATED!'}
          </h1>
          <p className="text-xs text-neutral-500 leading-snug">
            {step === 1
              ? 'Enter your registered email to receive a 6-digit recovery code.'
              : step === 2
              ? `Enter code sent to ${email} and choose a new password.`
              : 'Your password has been changed successfully. Redirecting to Sign In...'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-2.5 bg-red-50 border-l-4 border-red-600 rounded-r-xl flex items-start gap-2 text-red-700 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-2.5 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl flex items-start gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-3" noValidate>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Registered Email <span className="text-red-600">*</span>
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
                  className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                    focusedField === 'email' ? 'text-red-600' : 'text-neutral-400'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full h-12 sm:h-13 pl-10 pr-3.5 bg-transparent rounded-xl text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 sm:h-13 bg-neutral-950 hover:bg-red-600 active:scale-[0.99] text-white font-headline text-sm font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>SENDING CODE...</span>
                </>
              ) : (
                <>
                  <span>SEND RECOVERY CODE</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 font-headline block text-center mb-2">
                Enter 6-Digit Code
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
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
                    className="w-10 sm:w-12 h-11 sm:h-13 text-center text-xl sm:text-2xl font-black font-headline bg-neutral-50 border border-neutral-300 focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-600/10 text-neutral-950 rounded-xl outline-none transition-all shadow-xs"
                  />
                ))}
              </div>
            </div>

            {/* 2-Column: New Password & Confirm */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-0.5 truncate">
                  New Password <span className="text-red-600">*</span>
                </label>
                <div
                  className={`relative rounded-xl border transition-all ${
                    focusedField === 'newPassword'
                      ? 'border-red-600 ring-4 ring-red-600/10 bg-white'
                      : 'border-neutral-300 bg-neutral-50/70'
                  }`}
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="6+ chars"
                    value={newPassword}
                    onFocus={() => setFocusedField('newPassword')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full h-11 pl-2.5 pr-7 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-neutral-400 hover:text-neutral-800"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-0.5 truncate">
                  Confirm <span className="text-red-600">*</span>
                </label>
                <div
                  className={`relative rounded-xl border transition-all ${
                    focusedField === 'confirmPassword'
                      ? 'border-red-600 ring-4 ring-red-600/10 bg-white'
                      : 'border-neutral-300 bg-neutral-50/70'
                  }`}
                >
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat"
                    value={confirmPassword}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full h-11 pl-2.5 pr-7 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-neutral-400 hover:text-neutral-800"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 bg-neutral-950 hover:bg-red-600 active:scale-[0.99] text-white font-headline text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-70 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>UPDATING PASSWORD...</span>
                </>
              ) : (
                <>
                  <span>UPDATE & SIGN IN</span>
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
                <span>Change email</span>
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

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="text-center py-4 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              Password updated successfully! Redirecting to Sign In...
            </p>
            <Link
              href="/login"
              className="inline-block px-5 py-2.5 rounded-xl bg-neutral-950 text-white font-headline font-bold text-xs uppercase"
            >
              Go to Sign In
            </Link>
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-2 sm:pt-3 border-t border-neutral-100 text-center">
          <Link
            href="/login"
            className="text-xs font-bold text-neutral-600 hover:text-red-600 flex items-center justify-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-white via-neutral-50 to-red-50/50 md:from-neutral-100 md:via-neutral-50/70 md:to-neutral-100 flex flex-col justify-between selection:bg-red-600 selection:text-white z-50">
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

      {/* Main Container */}
      <main className="flex-1 flex justify-center items-center px-3.5 sm:px-4 py-2 overflow-hidden relative z-10">
        <Suspense
          fallback={
            <div className="p-6 text-center bg-white rounded-2xl border border-neutral-200 max-w-xs mx-auto shadow-md">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mt-2">Loading SportX...</p>
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </main>

      <footer className="py-2 text-center text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-widest font-semibold shrink-0 relative z-10">
        SPORT X WEAR &bull; BUILT FOR CHAMPIONS
      </footer>
    </div>
  );
}
