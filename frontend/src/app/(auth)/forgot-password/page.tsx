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
      if (res.success) {
        setStep(2);
        setResendCooldown(60);
        setSuccessMsg(res.message || `A 6-digit reset code has been sent to ${email.trim()}.`);
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'No registered account found with this email. Please register first.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP inputs handling
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    if (digit && index < 5) {
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
    pasteData.split('').forEach((char, idx) => {
      if (idx < 6) newOtp[idx] = char;
    });
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
        }, 2200);
      }
    } catch (err: any) {
      console.error('Reset password submit error:', err);
      setError(err.message || 'Failed to reset password. Please check your OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-[0_20px_50px_-10px_rgba(220,38,38,0.1),0_10px_30px_-5px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 relative z-10 backdrop-blur-sm">
      {/* Top Accent Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-neutral-950 to-red-600" />

      {/* Header */}
      <div className="p-3 sm:p-5 pb-0.5 text-center">
        <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-1 shadow-xs">
          <KeyRound className="w-4 h-4" />
        </div>
        <h1 className="font-headline text-lg sm:text-2xl font-black uppercase tracking-tight text-neutral-950">
          {step === 1 ? 'FORGOT PASSWORD' : step === 2 ? 'RESET PASSWORD' : 'PASSWORD UPDATED!'}
        </h1>
        <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 leading-tight">
          {step === 1
            ? 'Enter your email address to receive a 6-digit verification code.'
            : step === 2
            ? `Enter code sent to ${email} and choose your new password.`
            : 'Your password has been changed successfully. Redirecting to Sign In...'}
        </p>
      </div>

      <div className="p-3 sm:p-5 pt-1 space-y-2.5 sm:space-y-3">
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

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-2.5" noValidate>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Registered Email Address <span className="text-red-600">*</span>
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
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-9 pr-3.5 py-2 sm:py-2.5 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neutral-950 hover:bg-red-600 active:scale-[0.98] text-white font-headline text-xs sm:text-sm font-black uppercase tracking-wider py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-red-600/25 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group mt-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>SENDING CODE...</span>
                </>
              ) : (
                <>
                  <span>SEND RESET CODE</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter 6-digit OTP & Set New Password */}
        {step === 2 && (
          <form onSubmit={handleResetSubmit} className="space-y-2.5" noValidate>
            {/* 6-Digit OTP */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1 text-center">
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

            {/* New Password */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  New Password <span className="text-red-600">*</span>
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
                  focusedField === 'newPassword'
                    ? 'border-red-600 ring-4 ring-red-600/10 bg-white shadow-xs'
                    : 'border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50'
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                    focusedField === 'newPassword' ? 'text-red-600' : 'text-neutral-400'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="sportx_new_password"
                  id="sportx_new_password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onFocus={() => setFocusedField('newPassword')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-9 pr-9 py-1.5 sm:py-2 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Confirm New Password <span className="text-red-600">*</span>
                </label>
                {confirmPassword.length > 0 && (
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
                  name="sportx_confirm_new_password"
                  id="sportx_confirm_new_password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pl-9 pr-9 py-1.5 sm:py-2 bg-transparent rounded-xl text-xs sm:text-sm text-neutral-950 placeholder:text-neutral-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6 || !newPassword}
              className="w-full bg-neutral-950 hover:bg-red-600 active:scale-[0.98] text-white font-headline text-xs sm:text-sm font-black uppercase tracking-wider py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-red-600/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group mt-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>UPDATING PASSWORD...</span>
                </>
              ) : (
                <>
                  <span>RESET PASSWORD</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend OTP Timer & Actions */}
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
                  &larr; Change Email Address
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="text-center py-3 space-y-2.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto animate-in zoom-in-75 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-headline text-base sm:text-xl font-black uppercase text-neutral-950">
              PASSWORD RESET SUCCESSFUL!
            </h3>
            <p className="text-[11px] text-neutral-600 max-w-xs mx-auto">
              Your password has been changed. You can now use your new password to sign in.
            </p>
            <Link
              href={`/login?email=${encodeURIComponent(email)}`}
              className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
            >
              GO TO SIGN IN <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Back to Login Link */}
        <div className="text-center pt-2 border-t border-neutral-100">
          <Link
            href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-[11px] font-bold text-neutral-700 hover:text-red-600 inline-flex items-center gap-1 transition-colors"
          >
            &larr; Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
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

      {/* Main Form Container */}
      <main className="flex-1 flex justify-center items-center px-3.5 sm:px-4 py-1.5 overflow-hidden relative z-10">
        <Suspense
          fallback={
            <div className="p-5 text-center bg-white rounded-2xl border border-neutral-200 max-w-xs mx-auto shadow-md">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-600" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mt-1.5">Loading SportX...</p>
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </main>

      {/* Bottom Footer Note */}
      <footer className="py-1.5 sm:py-2 text-center text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-widest font-semibold shrink-0 relative z-10">
        SPORT X WEAR &bull; BUILT FOR CHAMPIONS
      </footer>
    </div>
  );
}
