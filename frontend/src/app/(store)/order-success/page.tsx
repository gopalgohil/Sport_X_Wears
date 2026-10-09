'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Loader2,
  Printer,
  ShoppingBag,
  Clock,
  Sparkles,
  MapPin,
  Phone,
  Banknote,
  Check,
} from 'lucide-react';
import Navbar from '../../../components/common/Navbar';
import Footer from '../../../components/common/Footer';
import { getOrderById } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';

function ConfettiEffect() {
  const [particles, setParticles] = useState<
    { id: number; left: number; color: string; delay: number; size: number }[]
  >([]);

  useEffect(() => {
    const colors = ['#dc2626', '#16a34a', '#2563eb', '#eab308', '#9333ea', '#ea580c'];
    const p = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      size: Math.random() * 8 + 6,
    }));
    setParticles(p);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((item) => (
        <span
          key={item.id}
          className="absolute top-0 animate-fall rounded-xs opacity-90"
          style={{
            left: `${item.left}%`,
            width: `${item.size}px`,
            height: `${item.size * 1.6}px`,
            backgroundColor: item.color,
            animationDuration: `${2.5 + Math.random() * 2}s`,
            animationDelay: `${item.delay}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Delivery estimation (2-3 business days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const deliveryDateFormatted = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getOrderById(orderId);
        if (data) {
          setOrder(data);
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="font-headline text-xs font-bold uppercase tracking-widest text-neutral-500">
          RETRIEVING ORDER CONFIRMATION...
        </p>
      </div>
    );
  }

  return (
    <>
      <ConfettiEffect />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Success Hero Header Card */}
        <div className="bg-white border border-neutral-200/90 rounded-lg p-6 sm:p-10 text-center shadow-sm space-y-4 relative overflow-hidden">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-emerald-50 border-2 border-emerald-300 rounded-full flex items-center justify-center text-emerald-600 shadow-sm animate-in zoom-in duration-300">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-headline text-xs font-black uppercase tracking-widest px-3 py-1 rounded">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>DISPATCH CONFIRMED</span>
          </div>

          <h1 className="font-headline text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
            ORDER PLACED SUCCESSFULLY!
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Your high-performance athletic kit has entered priority fulfillment. We will notify you via SMS and email when your parcel is dispatched.
          </p>

          {orderId && (
            <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-300 px-4 py-2 rounded font-mono text-xs font-bold uppercase text-neutral-800">
              <span>ORDER ID:</span>
              <span className="font-black text-red-600 tracking-wider">#{orderId.slice(-8).toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* ====================================================================
            FLIPKART-STYLE LIVE ORDER TRACKING TIMELINE
            ==================================================================== */}
        <div className="mt-5 bg-white border border-neutral-200/90 rounded-lg p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-5">
            <h3 className="font-headline text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-red-600" />
              <span>LIVE DELIVERY TRACKER</span>
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Estimated: {deliveryDateFormatted}
            </span>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-4 gap-2 text-center relative">
            {/* Step 1: Confirmed */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm z-10">
                <Check className="w-4 h-4" />
              </div>
              <p className="font-headline text-xs font-bold uppercase text-neutral-900 mt-2">
                Order Placed
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">Today</span>
            </div>

            {/* Step 2: Packed */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-sm z-10 animate-pulse">
                <Package className="w-4 h-4" />
              </div>
              <p className="font-headline text-xs font-bold uppercase text-neutral-900 mt-2">
                Packed
              </p>
              <span className="text-[10px] text-neutral-500 font-medium">Tomorrow</span>
            </div>

            {/* Step 3: Shipped */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center font-bold text-xs z-10">
                <Truck className="w-4 h-4" />
              </div>
              <p className="font-headline text-xs font-bold uppercase text-neutral-500 mt-2">
                Shipped
              </p>
              <span className="text-[10px] text-neutral-400 font-medium">In Transit</span>
            </div>

            {/* Step 4: Delivered */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center font-bold text-xs z-10">
                <MapPin className="w-4 h-4" />
              </div>
              <p className="font-headline text-xs font-bold uppercase text-neutral-500 mt-2">
                Delivered
              </p>
              <span className="text-[10px] text-neutral-400 font-medium">{deliveryDateFormatted}</span>
            </div>
          </div>
        </div>

        {/* ====================================================================
            ORDER DETAILS & RECIPIENT SUMMARY
            ==================================================================== */}
        {order && (
          <div className="mt-5 bg-white border border-neutral-200/90 rounded-lg p-5 sm:p-6 space-y-6 shadow-sm">
            {/* Recipient & Payment Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pb-5 border-b border-neutral-200 text-xs">
              <div>
                <p className="font-headline text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  RECIPIENT ATHLETE
                </p>
                <p className="font-headline text-sm font-black text-neutral-950">{order.customer?.name}</p>
                <p className="text-neutral-500">{order.customer?.email}</p>
                <p className="text-neutral-700 font-semibold mt-0.5">+91 {order.customer?.phone}</p>
              </div>

              <div>
                <p className="font-headline text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  DELIVERY ADDRESS
                </p>
                <p className="text-neutral-900 font-bold">{order.shippingAddress?.street}</p>
                <p className="text-neutral-600">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                </p>
                <p className="text-neutral-500 font-medium">India</p>
              </div>

              <div>
                <p className="font-headline text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  PAYMENT METHOD
                </p>
                <p className="font-headline text-sm font-black text-neutral-950 uppercase">
                  {order.paymentDetails?.method === 'cod'
                    ? 'CASH ON DELIVERY'
                    : order.paymentDetails?.method === 'upi'
                    ? 'GOOGLE PAY (UPI)'
                    : 'CARD PAYMENT'}
                </p>
                {order.paymentDetails?.transactionId && (
                  <p className="font-mono text-[11px] text-neutral-700 font-bold mt-0.5">
                    UTR: #{order.paymentDetails.transactionId}
                  </p>
                )}
                <p className="text-emerald-700 font-bold text-[11px] mt-0.5">
                  {order.paymentDetails?.method === 'cod'
                    ? 'Pay upon doorstep arrival'
                    : 'Payment Verified & Confirmed'}
                </p>
              </div>
            </div>

            {/* Ordered Items List */}
            <div>
              <h3 className="font-headline text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900 mb-3">
                ORDERED GEAR ({order.items?.length || 0})
              </h3>

              <div className="divide-y divide-neutral-100">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-16 bg-neutral-100 rounded border border-neutral-200 overflow-hidden shrink-0">
                        <Image
                          src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-headline text-xs sm:text-sm font-bold uppercase text-neutral-950">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                          Size: <span className="font-bold text-neutral-800">{item.size}</span> | Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-headline text-sm font-black text-neutral-950">
                      {formatPrice(item.priceAtPurchase * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-dashed border-neutral-300 flex items-center justify-between text-base font-headline">
                <span className="font-black text-neutral-950 uppercase">TOTAL AMOUNT:</span>
                <span className="text-xl sm:text-2xl font-black text-neutral-950">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 font-headline text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-neutral-600" /> PRINT INVOICE
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-headline text-xs font-black uppercase tracking-wider px-8 py-3.5 rounded transition-all shadow-md cursor-pointer"
          >
            CONTINUE SHOPPING <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f1f2f4] flex flex-col text-neutral-900">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-32 flex justify-center">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
          }
        >
          <OrderSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
