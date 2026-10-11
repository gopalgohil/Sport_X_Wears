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
  ShieldCheck,
} from 'lucide-react';
import { requestForgotPassword, submitResetPassword } from '../../../lib/api';

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  // Step 1 = Enter Registered Email, Step 2 = Enter 6-digit OTP & New Password, Step 3 = Success
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
      setError(err.message || 'Failed to dispatch verification code. Please check your email.');
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
    <div className="w-full max-w-lg mx-auto">
      <div className="w-full bg-neutral-900/90 sm:border sm:border-neutral-800 rounded-3xl sm:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl relative">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

        <div className="p-5 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-1 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-headline uppercase tracking-wide text-white">
              {step === 1 ? 'Forgot Password' : step === 2 ? 'Reset Password' : 'Password Updated!'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
              {step === 1
                ? 'Enter your registered email address to receive a 6-digit recovery code.'
                : step === 2
                ? `Enter the 6-digit code sent to ${email} and choose a new password.`
                : 'Your password has been changed successfully. Redirecting to Sign In...'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-950/70 border border-red-800 text-red-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-snug">{error}</p>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-snug">{successMsg}</p>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5" noValidate>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-headline">
                    Registered Email <span className="text-red-500">*</span>
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
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="w-full h-14 pl-12 pr-4 bg-transparent rounded-2xl text-base text-white placeholder:text-neutral-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-red-500 active:scale-[0.99] text-white font-headline text-base sm:text-lg font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.35)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>SENDING CODE...</span>
                  </>
                ) : (
                  <>
                    <span>SEND RECOVERY CODE</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 2 && (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-headline block text-center mb-3">
                  Enter 6-Digit Code
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

              {/* New Password */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-headline block mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative rounded-2xl border transition-all duration-200 ${
                    focusedField === 'newPassword'
                      ? 'border-red-500 ring-4 ring-red-500/15 bg-neutral-950'
                      : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                  }`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${
                      focusedField === 'newPassword' ? 'text-red-500' : 'text-neutral-500'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onFocus={() => setFocusedField('newPassword')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full h-14 pl-12 pr-12 bg-transparent rounded-2xl text-base text-white placeholder:text-neutral-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 font-headline block mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
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
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full h-14 pl-12 pr-12 bg-transparent rounded-2xl text-base text-white placeholder:text-neutral-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-red-500 active:scale-[0.99] text-white font-headline text-base sm:text-lg font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.35)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>RESETTING PASSWORD...</span>
                  </>
                ) : (
                  <>
                    <span>UPDATE & SIGN IN</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

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
                  <span>Change email</span>
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

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-sm text-neutral-300">
                Password updated! Redirecting to Sign In...
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 rounded-xl bg-red-600 text-white font-headline font-bold text-sm uppercase"
              >
                Go to Sign In
              </Link>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-neutral-800/80 text-center">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-bold text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
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
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col justify-between selection:bg-red-600 selection:text-white relative overflow-x-hidden">
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

      {/* Main Container */}
      <main className="flex-1 flex justify-center items-center px-4 sm:px-6 py-6 sm:py-12 relative z-10">
        <Suspense
          fallback={
            <div className="p-8 text-center bg-neutral-900 rounded-3xl border border-neutral-800 max-w-xs mx-auto shadow-xl">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mt-3">Loading SportX...</p>
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </main>

      <footer className="py-4 text-center text-xs text-neutral-500 uppercase tracking-widest font-semibold shrink-0 relative z-10 border-t border-neutral-900">
        SPORT X WEAR &bull; BUILT FOR CHAMPIONS
      </footer>
    </div>
  );
}
