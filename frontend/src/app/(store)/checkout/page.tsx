'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Mail,
  MapPin,
  Building,
  Home,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  X,
  QrCode,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { formatPrice } from '../../../lib/utils';
import { createOrder, CreateOrderPayload } from '../../../lib/api';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: 'Maharashtra',
    postalCode: '',
    addressType: 'home', // 'home' | 'work'
  });

  // Pre-fill user data when authenticated
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        street: prev.street || user.addresses?.[0]?.street || '',
        city: prev.city || user.addresses?.[0]?.city || '',
        state: prev.state || user.addresses?.[0]?.state || 'Maharashtra',
        postalCode: prev.postalCode || user.addresses?.[0]?.postalCode || '',
      }));
    }
  }, [user]);

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [itemsExpanded, setItemsExpanded] = useState(true);

  // Interactive UPI QR Modal State (Gopal Gohel Google Pay)
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiTimer, setUpiTimer] = useState(300); // 5-minute countdown
  const [upiUtr, setUpiUtr] = useState('');
  const [utrError, setUtrError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [generatedQrDataUrl, setGeneratedQrDataUrl] = useState<string>('');
  const [qrViewMode, setQrViewMode] = useState<'npci' | 'original'>('npci');

  // Shipping & Savings Calculation
  const shippingFee = subtotal >= 1999 || subtotal === 0 ? 0 : 149;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Dynamic NPCI Standard QR Code generation
  useEffect(() => {
    async function generateStandardQr() {
      try {
        const upiUri = `upi://pay?pa=gopalgohel249@oksbi&pn=gopal%20gohel&am=${grandTotal}&cu=INR&tn=SPORTXWEAR%20Order`;
        const dataUrl = await QRCode.toDataURL(upiUri, {
          width: 320,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
        setGeneratedQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate dynamic UPI QR:', err);
      }
    }
    if (grandTotal > 0) {
      generateStandardQr();
    }
  }, [grandTotal]);

  // UPI 5-minute countdown timer effect
  useEffect(() => {
    let interval: any;
    if (showUpiModal && upiTimer > 0) {
      interval = setInterval(() => {
        setUpiTimer((prev) => prev - 1);
      }, 1000);
    } else if (upiTimer === 0 && showUpiModal) {
      setShowUpiModal(false);
      setGlobalError('UPI payment session expired. Please try placing your order again.');
    }
    return () => clearInterval(interval);
  }, [showUpiModal, upiTimer]);

  // Total original retail price before discounts
  const originalMrp = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalSavings = Math.max(0, originalMrp - grandTotal);

  // Validation Logic
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        if (!/^[a-zA-Z\s.]+$/.test(value.trim())) return 'Only alphabets and spaces allowed';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()))
          return 'Enter valid email address (e.g. name@domain.com)';
        return '';

      case 'phone':
        if (!value.trim()) return 'Mobile number is required';
        if (!/^[6-9]\d{9}$/.test(value.trim()))
          return 'Enter valid 10-digit mobile number (starts with 6-9)';
        return '';

      case 'street':
        if (!value.trim()) return 'House no. & street address required';
        if (value.trim().length < 6) return 'Provide complete street/area address';
        return '';

      case 'city':
        if (!value.trim()) return 'City is required';
        if (value.trim().length < 2) return 'Enter a valid city name';
        return '';

      case 'postalCode':
        if (!value.trim()) return 'PIN code is required';
        if (!/^\d{6}$/.test(value.trim())) return 'PIN code must be exactly 6 digits';
        return '';

      default:
        return '';
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'phone') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'postalCode') {
      processedValue = value.replace(/\D/g, '').slice(0, 6);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (touched[name]) {
      const errorMsg = validateField(name, processedValue);
      setErrors((prev) => ({
        ...prev,
        [name]: errorMsg,
      }));
    }

    setGlobalError('');
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === 'CHAMPION10' || couponCode.toUpperCase() === 'SPORT10') {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon. Use CHAMPION10 for 10% OFF.');
    }
  };

  const validateAll = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const newTouched: { [key: string]: boolean } = {};

    ['name', 'email', 'phone', 'street', 'city', 'postalCode'].forEach((key) => {
      newTouched[key] = true;
      const err = validateField(key, (formData as any)[key]);
      if (err) {
        newErrors[key] = err;
      }
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const executeOrderSubmission = async (
    paymentMethodUsed?: 'cod' | 'upi' | 'card',
    utrId?: string
  ) => {
    setIsSubmitting(true);
    setGlobalError('');

    try {
      const activeMethod = paymentMethodUsed || paymentMethod;
      const payload: CreateOrderPayload = {
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
        items: items.map((item) => ({
          product: item.product._id,
          title: item.product.title,
          size: item.size,
          quantity: item.quantity,
          priceAtPurchase: item.product.discountPrice || item.product.price,
          image: item.product.images[0] || '',
        })),
        shippingAddress: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: 'IN',
        },
        paymentMethod: activeMethod,
        transactionId: utrId ? utrId.trim() : undefined,
      };

      const result = await createOrder(payload, token);

      if (result.success && result.data?._id) {
        clearCart();
        router.push(`/order-success?orderId=${result.data._id}`);
      } else {
        throw new Error(result.message || 'Unable to place order');
      }
    } catch (err: any) {
      console.error('Order submission failed:', err);
      setGlobalError(err.message || 'Unable to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowUpiModal(false);
    }
  };

  const handleSubmitOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (items.length === 0) {
      setGlobalError('Your bag is empty.');
      return;
    }

    const isValid = validateAll();
    if (!isValid) {
      setGlobalError('Please fill in the required delivery fields correctly.');
      const firstError = Object.keys(errors)[0] || 'name';
      const el = document.getElementsByName(firstError)[0];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // If customer selected UPI, launch interactive QR Code Modal first
    if (paymentMethod === 'upi') {
      setUpiTimer(300);
      setShowUpiModal(true);
      return;
    }

    // For COD and Card, execute immediate order submission
    await executeOrderSubmission('cod');
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
            <Truck className="w-8 h-8" />
          </div>
          <h2 className="font-headline text-2xl font-black uppercase text-neutral-950">
            YOUR BAG IS EMPTY
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Add athletic garments to proceed with order dispatch.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs font-bold uppercase tracking-wider px-6 py-3.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> RETURN TO STORE
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f2f4] text-neutral-900 flex flex-col pb-24 sm:pb-12">
      {/* ====================================================================
          1. AMAZON / FLIPKART MOBILE HEADER & STEPPER
          ==================================================================== */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1 text-neutral-700 hover:text-neutral-950 transition-colors"
              aria-label="Back to store"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-headline text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-neutral-950 flex items-center">
              SPORT <span className="text-red-600 px-0.5 transform -skew-x-12 inline-block">X</span> WEAR
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% SECURE</span>
          </div>
        </div>

        {/* Flipkart-Style 3-Step Indicator Bar */}
        <div className="bg-neutral-50 border-t border-neutral-200/80 px-4 py-2">
          <div className="max-w-md mx-auto flex items-center justify-between text-[11px] font-headline font-bold uppercase tracking-wider">
            <span className="text-red-600 flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-black">
                1
              </span>
              Address
            </span>
            <div className="flex-1 h-[2px] bg-red-600 mx-2" />
            <span className="text-red-600 flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-black">
                2
              </span>
              Summary
            </span>
            <div className="flex-1 h-[2px] bg-neutral-300 mx-2" />
            <span className="text-neutral-500 flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-neutral-300 text-neutral-700 text-[9px] flex items-center justify-center font-black">
                3
              </span>
              Payment
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
        {globalError && (
          <div className="mb-4 p-3.5 bg-red-50 border-l-4 border-red-600 rounded-sm shadow-xs flex items-center gap-2.5 text-red-700 text-xs sm:text-sm font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{globalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
            {/* Left Column (8 cols): Address, Items, Payment */}
            <div className="lg:col-span-8 space-y-3.5">

              {/* =======================================================
                  CARD 1: DELIVERY ADDRESS (Flipkart/Amazon style card)
                 ======================================================= */}
              <div className="bg-white rounded-lg border border-neutral-200/90 shadow-xs overflow-hidden">
                {/* Header */}
                <div className="bg-neutral-50/80 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-headline text-[10px] font-black flex items-center justify-center">
                      1
                    </span>
                    <h2 className="font-headline text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900">
                      DELIVERY ADDRESS
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    REQUIRED
                  </span>
                </div>

                {/* Authentication Banner */}
                {isAuthenticated && user ? (
                  <div className="px-4 py-2.5 bg-neutral-900 text-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>
                        Logged in as <strong className="text-red-400 font-headline uppercase tracking-wide">{user.name}</strong> ({user.email})
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Orders Auto-Synced
                    </span>
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-[11px] flex items-center justify-between font-medium">
                    <span>
                      Have a SPORT X WEAR athlete account?
                    </span>
                    <Link
                      href="/login?redirect=/checkout"
                      className="font-bold text-red-600 hover:underline uppercase text-[10px] tracking-wider"
                    >
                      Sign In for Express Checkout &rarr;
                    </Link>
                  </div>
                )}

                {/* Form Inputs */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. Virat Sharma"
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full bg-white border rounded px-3 py-2.5 text-xs text-neutral-900 focus:outline-none transition-colors ${
                          touched.name && errors.name
                            ? 'border-red-500 bg-red-50/20'
                            : 'border-neutral-300 focus:border-red-600'
                        }`}
                      />
                      {touched.name && errors.name && (
                        <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3" /> {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                        10-Digit Mobile Number *
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-2.5 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l text-xs font-bold text-neutral-600">
                          +91
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          maxLength={10}
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full bg-white border rounded-r px-3 py-2.5 text-xs text-neutral-900 focus:outline-none transition-colors ${
                            touched.phone && errors.phone
                              ? 'border-red-500 bg-red-50/20'
                              : 'border-neutral-300 focus:border-red-600'
                          }`}
                        />
                      </div>
                      {touched.phone && errors.phone && (
                        <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3" /> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      Email Address (for order tracking & invoice) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="athlete@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full bg-white border rounded px-3 py-2.5 text-xs text-neutral-900 focus:outline-none transition-colors ${
                        touched.email && errors.email
                          ? 'border-red-500 bg-red-50/20'
                          : 'border-neutral-300 focus:border-red-600'
                      }`}
                    />
                    {touched.email && errors.email && (
                      <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Street / Building Address */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                      House No., Building Name, Street / Area *
                    </label>
                    <input
                      type="text"
                      name="street"
                      placeholder="e.g. Flat 402, Olympian Heights, Link Road, Andheri West"
                      value={formData.street}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full bg-white border rounded px-3 py-2.5 text-xs text-neutral-900 focus:outline-none transition-colors ${
                        touched.street && errors.street
                          ? 'border-red-500 bg-red-50/20'
                          : 'border-neutral-300 focus:border-red-600'
                      }`}
                    />
                    {touched.street && errors.street && (
                      <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" /> {errors.street}
                      </p>
                    )}
                  </div>

                  {/* PIN Code, City, State Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                        Pincode (6 digits) *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        maxLength={6}
                        placeholder="400053"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full bg-white border rounded px-3 py-2.5 text-xs text-neutral-900 focus:outline-none font-mono ${
                          touched.postalCode && errors.postalCode
                            ? 'border-red-500 bg-red-50/20'
                            : 'border-neutral-300 focus:border-red-600'
                        }`}
                      />
                      {touched.postalCode && errors.postalCode && (
                        <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3" /> {errors.postalCode}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full bg-white border rounded px-3 py-2.5 text-xs text-neutral-900 focus:outline-none ${
                          touched.city && errors.city
                            ? 'border-red-500 bg-red-50/20'
                            : 'border-neutral-300 focus:border-red-600'
                        }`}
                      />
                      {touched.city && errors.city && (
                        <p className="text-red-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3" /> {errors.city}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                        State *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-neutral-300 rounded px-2.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-red-600 cursor-pointer"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address Type Selector (Flipkart / Amazon App Feature) */}
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1.5">
                      Type of address:
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, addressType: 'home' }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border ${
                          formData.addressType === 'home'
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>Home (All day)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, addressType: 'work' }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer border ${
                          formData.addressType === 'work'
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Work (10 AM - 5 PM)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* =======================================================
                  CARD 2: ORDER SUMMARY (Flipkart App Collapsible Card)
                 ======================================================= */}
              <div className="bg-white rounded-lg border border-neutral-200/90 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setItemsExpanded(!itemsExpanded)}
                  className="w-full bg-neutral-50/80 px-4 py-3 border-b border-neutral-200 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-headline text-[10px] font-black flex items-center justify-center">
                      2
                    </span>
                    <h2 className="font-headline text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900">
                      ORDER ITEMS ({items.length})
                    </h2>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 font-bold">
                    <span>{itemsExpanded ? 'Hide' : 'View'}</span>
                    {itemsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {itemsExpanded && (
                  <div className="divide-y divide-neutral-100 p-3 sm:p-4">
                    {items.map((item) => (
                      <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex gap-3 sm:gap-4 items-center">
                        <div className="relative w-16 h-20 bg-neutral-100 rounded border border-neutral-200 overflow-hidden shrink-0">
                          <Image
                            src={item.product.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-headline text-xs sm:text-sm font-bold uppercase text-neutral-950 truncate">
                            {item.product.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500 font-semibold">
                            <span className="bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                              Size: {item.size}
                            </span>
                            <span>Qty: {item.quantity}</span>
                          </div>

                          <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="font-headline text-sm font-black text-neutral-950">
                              {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                            </span>
                            {item.product.discountPrice && (
                              <span className="text-[11px] text-neutral-400 line-through">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                            )}
                          </div>

                          {/* Delivery estimate callout (Flipkart style) */}
                          <p className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-emerald-600" />
                            Delivery in 2-3 Days | FREE
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* =======================================================
                  CARD 3: PAYMENT METHOD (Flipkart App Radio Card)
                 ======================================================= */}
              <div className="bg-white rounded-lg border border-neutral-200/90 shadow-xs overflow-hidden">
                <div className="bg-neutral-50/80 px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-headline text-[10px] font-black flex items-center justify-center">
                      3
                    </span>
                    <h2 className="font-headline text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900">
                      PAYMENT OPTIONS
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">
                    SECURE GATEWAY
                  </span>
                </div>

                <div className="p-3 sm:p-4 space-y-2.5">
                  {/* COD */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3.5 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-neutral-950 bg-neutral-50/80 shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-headline text-xs sm:text-sm font-extrabold uppercase text-neutral-950">
                          Cash on Delivery (COD)
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Pay with cash or UPI QR upon doorstep arrival
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-neutral-950 w-4 h-4"
                    />
                  </label>

                  {/* UPI */}
                  <label
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3.5 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-neutral-950 bg-neutral-50/80 shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-headline text-xs sm:text-sm font-extrabold uppercase text-neutral-950">
                          UPI (Google Pay, PhonePe, Paytm)
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Instant payment via your preferred UPI app
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-neutral-950 w-4 h-4"
                    />
                  </label>

                  {/* Cards */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3.5 rounded-lg border-2 flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-neutral-950 bg-neutral-50/80 shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-headline text-xs sm:text-sm font-extrabold uppercase text-neutral-950">
                          Credit / Debit / ATM Card
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Visa, MasterCard, RuPay, Maestro
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-neutral-950 w-4 h-4"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Price Details Card (Flipkart Format) */}
            <div className="lg:col-span-4 space-y-3.5 lg:sticky lg:top-20">
              <div className="bg-white rounded-lg border border-neutral-200/90 shadow-xs p-4 sm:p-5 space-y-4">
                <h3 className="font-headline text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-2.5">
                  PRICE DETAILS
                </h3>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs text-neutral-700">
                  <div className="flex justify-between">
                    <span>Price ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                    <span className="font-semibold text-neutral-900">{formatPrice(originalMrp)}</span>
                  </div>

                  {originalMrp > subtotal && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Product Discount</span>
                      <span className="font-semibold">-{formatPrice(originalMrp - subtotal)}</span>
                    </div>
                  )}

                  {couponApplied && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon (CHAMPION10)</span>
                      <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Delivery Charges</span>
                    <span className={shippingFee === 0 ? 'text-emerald-600 font-bold' : 'text-neutral-900 font-semibold'}>
                      {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-dashed border-neutral-300 flex justify-between items-baseline text-sm sm:text-base font-headline font-black text-neutral-950">
                    <span>Total Amount</span>
                    <span className="text-xl sm:text-2xl text-neutral-950">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Flipkart Signature Green Savings Callout */}
                {totalSavings > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>You will save {formatPrice(totalSavings)} on this order</span>
                  </div>
                )}

                {/* Promo Code Box */}
                <div className="pt-2 border-t border-neutral-100">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3 h-3 text-neutral-400 absolute left-2.5 top-3" />
                      <input
                        type="text"
                        placeholder="Coupon: CHAMPION10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded pl-8 pr-2 py-2 text-xs text-neutral-900 uppercase font-headline tracking-wider focus:outline-none focus:border-neutral-900"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white font-headline text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 10% OFF applied!
                    </p>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">
                      {couponError}
                    </p>
                  )}
                </div>

                {/* Desktop Place Order Button (Hidden on Mobile) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="hidden sm:flex w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-400 text-white font-headline text-sm font-black tracking-wider uppercase py-3.5 rounded items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> DISPATCHING...
                    </>
                  ) : (
                    <>PLACE ORDER ({formatPrice(grandTotal)})</>
                  )}
                </button>

                {/* Trust Footer */}
                <div className="text-center text-[10px] text-neutral-500 font-semibold uppercase tracking-wider flex items-center justify-center gap-2 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Safe and Secure Payments • 100% Authentic</span>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================================
              FLIPKART / AMAZON SIGNATURE MOBILE STICKY BOTTOM BAR
              (Fixed at the bottom of the screen on mobile devices)
              ==================================================================== */}
          <div className="fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 z-50 p-3 sm:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.1)] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Total Payable
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline text-xl font-black text-neutral-950">
                  {formatPrice(grandTotal)}
                </span>
                {totalSavings > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600">
                    Saved {formatPrice(totalSavings)}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-neutral-400 text-white font-headline text-xs font-black tracking-wider uppercase px-6 py-3 rounded shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> DISPATCHING...
                </>
              ) : (
                <>PLACE ORDER</>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* ====================================================================
          REAL GOOGLE PAY UPI QR MODAL (Gopal Gohel)
          ==================================================================== */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-neutral-300 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#1a73e8] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-xs">
                  <Smartphone className="w-5 h-5 text-[#1a73e8]" />
                </div>
                <div>
                  <h3 className="font-headline text-base font-black uppercase tracking-wider">
                    GOOGLE PAY / UPI SCANNER
                  </h3>
                  <p className="text-[11px] text-blue-100 font-medium">
                    Payee: gopal gohel (Official Store Merchant)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUpiModal(false)}
                className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-3.5 text-center">
              {/* Amount Banner */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  TOTAL AMOUNT TO PAY:
                </span>
                <p className="font-headline text-3xl font-black text-neutral-950 mt-0.5">
                  {formatPrice(grandTotal)}
                </p>
              </div>

              {/* Direct UPI App Intent Link for Mobile */}
              <div>
                <a
                  href={`upi://pay?pa=gopalgohel249@oksbi&pn=gopal%20gohel&am=${grandTotal}&cu=INR&tn=SPORTXWEAR%20Order`}
                  className="w-full bg-[#1a73e8] hover:bg-blue-700 text-white font-headline text-xs font-bold uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" /> OPEN IN GPAY / PHONEPE / PAYTM <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <p className="text-[10px] text-neutral-400 mt-1">
                  (Mobile users: Tap button above to open payment app directly without scanning)
                </p>
              </div>

              {/* QR Code Tab Switcher */}
              <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200 text-xs font-headline font-bold uppercase">
                <button
                  type="button"
                  onClick={() => setQrViewMode('npci')}
                  className={`flex-1 py-1.5 rounded transition-all cursor-pointer ${
                    qrViewMode === 'npci'
                      ? 'bg-white text-neutral-950 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  Dynamic UPI QR (All Apps)
                </button>
                <button
                  type="button"
                  onClick={() => setQrViewMode('original')}
                  className={`flex-1 py-1.5 rounded transition-all cursor-pointer ${
                    qrViewMode === 'original'
                      ? 'bg-white text-neutral-950 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  GPay Card (Gopal Gohel)
                </button>
              </div>

              {/* QR Code Container */}
              <div className="relative w-64 h-68 mx-auto bg-white p-3 border-2 border-neutral-300 rounded-xl flex flex-col items-center justify-center shadow-sm">
                {qrViewMode === 'npci' ? (
                  generatedQrDataUrl ? (
                    <div className="flex flex-col items-center">
                      <Image
                        src={generatedQrDataUrl}
                        alt="Standard NPCI UPI QR Code"
                        width={210}
                        height={210}
                        className="rounded object-contain"
                        priority
                      />
                      <span className="text-[10px] font-bold text-neutral-500 mt-1 tracking-wider uppercase">
                        Scan with GPay / PhonePe / Paytm / BHIM
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
                      <Loader2 className="w-6 h-6 animate-spin text-neutral-500 mb-2" />
                      <span className="text-xs">Generating UPI QR...</span>
                    </div>
                  )
                ) : (
                  <Image
                    src="/images/gpay-qr.png"
                    alt="Gopal Gohel Google Pay QR Code"
                    width={220}
                    height={240}
                    className="rounded object-contain"
                    priority
                  />
                )}
              </div>

              {/* Why "Can't Pay" Notice for Self-Scan */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-left text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950">&quot;Can&apos;t pay this QR code&quot; error kyu aata hai?</span>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    Agar aap <strong>apne hi phone/account</strong> se apna hi QR code scan kar rahe hain, toh Google Pay khud ke account par transfer allow nahi karta (Self-transfer blocked). Testing ke liye <strong>kisi dusre phone ya family member ke phone</strong> se scan karein, ya upar diye <strong>&quot;Open in GPay&quot;</strong> button ko use karein.
                  </p>
                </div>
              </div>

              {/* UPI ID with Copy Button */}
              <div className="flex items-center justify-between bg-neutral-100 border border-neutral-200 px-3.5 py-2.5 rounded-lg text-xs">
                <div className="text-left">
                  <p className="text-[10px] text-neutral-500 font-bold uppercase">UPI ID</p>
                  <p className="font-mono font-bold text-neutral-900 select-all">
                    gopalgohel249@oksbi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('gopalgohel249@oksbi');
                    setCopiedUpi(true);
                    setTimeout(() => setCopiedUpi(false), 2000);
                  }}
                  className="flex items-center gap-1 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 px-2.5 py-1.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy ID
                    </>
                  )}
                </button>
              </div>

              {/* Payment Steps Instructions */}
              <div className="text-left text-xs bg-blue-50 border border-blue-200 p-3 rounded-lg space-y-1 text-blue-900">
                <p className="font-bold">Instructions:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-blue-800">
                  <li>Apne phone mein Google Pay, PhonePe ya Paytm se upar diya QR scan karein.</li>
                  <li>Exact <strong>{formatPrice(grandTotal)}</strong> pay karein.</li>
                  <li>Payment ke baad Google Pay receipt par diya <strong>12-digit UPI Ref / UTR No.</strong> neeche dalein.</li>
                </ol>
              </div>

              {/* 12-Digit UTR Input */}
              <div className="text-left space-y-1.5 pt-1">
                <label className="block text-xs font-bold uppercase text-neutral-800">
                  ENTER 12-DIGIT UPI REFERENCE / UTR NO. *
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="e.g. 428192847192"
                  value={upiUtr}
                  onChange={(e) => {
                    setUpiUtr(e.target.value.replace(/\D/g, '').slice(0, 12));
                    setUtrError('');
                  }}
                  className={`w-full bg-white border rounded px-3.5 py-2.5 text-sm font-mono tracking-wider text-neutral-900 focus:outline-none ${
                    utrError ? 'border-red-500 bg-red-50/20' : 'border-neutral-300 focus:border-[#1a73e8]'
                  }`}
                />
                {utrError && (
                  <p className="text-red-600 text-[11px] font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {utrError}
                  </p>
                )}
                <p className="text-[10px] text-neutral-400">
                  (Yeh 12 number aapke Google Pay payment receipt par `UPI transaction ID` ya `UTR` naam se likha hota hai)
                </p>
              </div>

              {/* Confirm / Submit Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (!upiUtr || upiUtr.length < 12) {
                    setUtrError('Kripya Google Pay receipt se poora 12-digit UPI / UTR number enter karein');
                    return;
                  }
                  executeOrderSubmission('upi', upiUtr);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-400 text-white font-headline text-sm font-black uppercase tracking-wider py-3.5 rounded shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> VERIFYING DISPATCH...
                  </>
                ) : (
                  <>VERIFY & CONFIRM ORDER</>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowUpiModal(false)}
                className="text-xs font-bold text-neutral-500 hover:text-neutral-900 uppercase underline cursor-pointer"
              >
                Cancel / Choose Cash on Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
