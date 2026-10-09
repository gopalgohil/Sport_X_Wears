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
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

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

  // Step 1: Submit Details & Request OTP via Brevo
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setError('Please provide your full athlete name.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
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
    <div className="w-full max-w-md mx-auto bg-white border border-neutral-200/90 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.14),0_8px_20px_rgba(0,0,0,0.08)] overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-8 pb-1 sm:pb-2 text-center">
        {step === 1 ? (
          <>
            <h1 className="font-headline text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
              Create Account
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Sign up to track orders and enjoy fast express checkout.
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
              Verify Email Code
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              Enter the 6-digit code sent to <strong className="text-neutral-900">{formData.email}</strong>
            </p>
          </>
        )}
      </div>

      {/* Form Body */}
      <div className="p-5 sm:p-8 pt-3 sm:pt-4 space-y-3 sm:space-y-3.5">
        {error && (
          <div className="p-3 sm:p-3.5 bg-red-50 border-l-4 border-red-600 rounded-sm flex items-start gap-2.5 text-red-700 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 sm:p-3.5 bg-emerald-50 border-l-4 border-emerald-600 rounded-sm flex items-start gap-2.5 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Registration Inputs */}
        {step === 1 ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 sm:space-y-3.5" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Full Athlete Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rohit Verma"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="athlete@domain.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Mobile Number (SMS delivery tracking)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-2.5 sm:px-3 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-lg text-xs sm:text-sm font-bold text-neutral-600">
                  +91
                </span>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-400">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3 py-2.5 bg-white border border-neutral-300 rounded-r-lg text-sm text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Password (min 6 characters) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs sm:text-sm font-extrabold uppercase tracking-wider py-3 sm:py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  SENDING VERIFICATION CODE...
                </>
              ) : (
                <>
                  CONTINUE & VERIFY EMAIL <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: 6-Digit OTP Box Inputs */
          <form onSubmit={handleVerifySubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2 text-center">
                Enter 6-Digit Verification Code
              </label>
              <div className="flex justify-between gap-2 max-w-xs mx-auto">
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
                    className="w-11 sm:w-12 h-13 sm:h-14 text-center font-headline text-2xl font-black border-2 border-neutral-300 rounded-lg focus:border-red-600 focus:outline-none transition-colors shadow-xs bg-white text-neutral-950"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs sm:text-sm font-extrabold uppercase tracking-wider py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  VERIFYING CODE...
                </>
              ) : (
                <>
                  VERIFY & ACTIVATE ACCOUNT <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend OTP Timer & Actions */}
            <div className="pt-2 text-center space-y-2">
              {resendCooldown > 0 ? (
                <p className="text-xs text-neutral-500 font-semibold">
                  Resend code in <span className="font-bold text-neutral-900">{resendCooldown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-2 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {isResending ? 'Resending code...' : 'Resend Verification Code'}
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
                  className="text-[11px] text-neutral-500 hover:text-neutral-900 underline underline-offset-2 cursor-pointer"
                >
                  Change Email Address
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Footer Link to Login */}
        <div className="text-center pt-3 border-t border-neutral-100">
          <p className="text-xs text-neutral-600">
            Already have an athlete account?{' '}
            <Link
              href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
              className="font-bold text-red-600 hover:text-red-700 underline underline-offset-2 ml-1"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#eae7df] flex flex-col justify-start sm:justify-center pt-4 pb-10 sm:py-12 px-3.5 sm:px-6">
      {/* Brand Header */}
      <div className="text-center mb-3 sm:mb-6 pt-1 sm:pt-0">
        <Link href="/" className="inline-block group">
          <span className="font-headline text-2xl sm:text-4xl font-black tracking-tighter uppercase italic text-neutral-950 flex items-center justify-center">
            SPORT <span className="text-red-600 px-1 transform -skew-x-12 inline-block">X</span> WEAR
          </span>
        </Link>
      </div>

      {/* Main Register Card */}
      <div className="flex justify-center items-center w-full">
        <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-600" /></div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
