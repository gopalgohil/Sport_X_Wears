'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Package,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  LogOut,
  Edit2,
  Save,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getMyOrders } from '../../../lib/api';
import { Order } from '../../../types';
import { formatPrice } from '../../../lib/utils';
import Navbar from '../../../components/common/Navbar';
import Footer from '../../../components/common/Footer';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, logout, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  // Fetch orders when user & token are present
  useEffect(() => {
    async function fetchOrders() {
      if (!token) return;
      setIsOrdersLoading(true);
      setOrdersError('');
      try {
        const res = await getMyOrders(token);
        if (res.success && Array.isArray(res.data)) {
          setOrders(res.data);
        }
      } catch (err: any) {
        console.error('Failed to load orders:', err);
        setOrdersError(err.message || 'Unable to fetch your order history.');
      } finally {
        setIsOrdersLoading(false);
      }
    }

    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    if (!editName.trim()) {
      setSaveError('Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f2f4] flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-900 mb-3" />
        <p className="font-headline text-sm font-bold uppercase tracking-wider text-neutral-600">
          LOADING ATHLETE ROSTER...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#f1f2f4] flex flex-col justify-between">
        <Navbar />
        <main className="max-w-md mx-auto my-auto p-6 w-full text-center">
          <div className="bg-white p-8 rounded-xl border border-neutral-200 shadow-md space-y-4">
            <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500">
              <User className="w-8 h-8" />
            </div>
            <h2 className="font-headline text-2xl font-black uppercase text-neutral-950">
              ATHLETE SIGN-IN REQUIRED
            </h2>
            <p className="text-xs text-neutral-600">
              Please sign in to view your dynamic order history, tracking updates, and manage your athlete profile.
            </p>
            <div className="pt-2">
              <Link
                href="/login?redirect=/profile"
                className="w-full inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-red-600 text-white font-headline text-sm font-extrabold uppercase tracking-wider py-3 px-6 rounded-lg transition-colors"
              >
                SIGN IN NOW <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-[11px] text-neutral-500 pt-2">
              Don't have an account?{' '}
              <Link href="/register?redirect=/profile" className="font-bold text-red-600 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> DELIVERED
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase">
            <Truck className="w-3 h-3 text-blue-600" /> IN TRANSIT
          </span>
        );
      case 'processing':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase">
            <Clock className="w-3 h-3 text-amber-600" /> PROCESSING
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f2f4] flex flex-col justify-between text-neutral-900">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Athlete Overview Card */}
        <div className="bg-white rounded-xl border border-neutral-200/90 shadow-xs p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Athlete Avatar Initials */}
              <div className="w-16 h-16 rounded-full bg-neutral-950 text-white font-headline text-2xl font-black flex items-center justify-center shrink-0 border-2 border-red-600">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'SX'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-headline text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
                    {user.name}
                  </h1>
                  <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                    {user.role === 'admin' ? 'ADMINISTRATOR' : 'ELITE ATHLETE'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1 text-xs text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" /> {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" /> +91 {user.phone}
                    </span>
                  )}
                  {user.createdAt && (
                    <span className="flex items-center gap-1 text-neutral-400">
                      <Calendar className="w-3.5 h-3.5" /> Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase rounded-lg transition-colors border border-neutral-300"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-red-600 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-neutral-200 mt-6 -mb-6 -mx-6 sm:-mx-8 px-6 sm:px-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 font-headline text-sm font-extrabold uppercase tracking-wider transition-colors relative cursor-pointer ${
                activeTab === 'orders'
                  ? 'text-neutral-950 border-b-2 border-red-600'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              MY ORDERS ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 font-headline text-sm font-extrabold uppercase tracking-wider transition-colors relative cursor-pointer ${
                activeTab === 'settings'
                  ? 'text-neutral-950 border-b-2 border-red-600'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              ACCOUNT PROFILE
            </button>
          </div>
        </div>

        {/* Tab Content 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {isOrdersLoading ? (
              <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-600" />
                <p className="text-xs font-bold uppercase text-neutral-500">
                  Retrieving your live gear orders...
                </p>
              </div>
            ) : ordersError ? (
              <div className="bg-white rounded-xl border border-red-200 p-6 text-center space-y-2 text-red-600 text-xs">
                <AlertCircle className="w-6 h-6 mx-auto text-red-600" />
                <p className="font-bold">{ordersError}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-headline text-xl font-bold uppercase text-neutral-950">
                  NO ORDERS FOUND YET
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  You haven't placed any orders under this athlete account. Check out our high-performance apparel!
                </p>
                <Link
                  href="/#products-section"
                  className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" /> EXPLORE COLLECTIONS
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden"
                >
                  {/* Order Card Header */}
                  <div className="bg-neutral-50 px-4 sm:px-6 py-3.5 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase block">
                          ORDER PLACED
                        </span>
                        <span className="font-bold text-neutral-800">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase block">
                          TOTAL PAID
                        </span>
                        <span className="font-headline font-black text-neutral-950">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase block">
                          ORDER ID
                        </span>
                        <span className="font-mono text-neutral-700 font-bold">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.orderStatus)}
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="p-4 sm:p-6 divide-y divide-neutral-100">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-16 h-20 bg-neutral-100 rounded border border-neutral-200 overflow-hidden shrink-0">
                            <Image
                              src={
                                item.image ||
                                (typeof item.product === 'object' && item.product?.images?.[0]) ||
                                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
                              }
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-headline text-sm font-bold uppercase text-neutral-950">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500 font-semibold">
                              <span className="bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                                Size: {item.size}
                              </span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                            <p className="font-headline text-sm font-extrabold text-neutral-950 mt-1">
                              {formatPrice(item.priceAtPurchase * item.quantity)}
                            </p>
                          </div>
                        </div>

                        <div className="sm:text-right text-xs text-neutral-500 space-y-1">
                          <p className="font-bold text-neutral-800">
                            Payment: {order.paymentDetails.method.toUpperCase()} ({order.paymentDetails.status})
                          </p>
                          <p className="text-[11px] text-neutral-500 flex items-center sm:justify-end gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content 2: Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-neutral-200/90 shadow-xs p-6 sm:p-8 max-w-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
              <div>
                <h3 className="font-headline text-lg font-black uppercase text-neutral-950">
                  ATHLETE PROFILE SETTINGS
                </h3>
                <p className="text-xs text-neutral-500">
                  Keep your athlete name and mobile dispatch contact current.
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              )}
            </div>

            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-600 rounded-sm text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Profile updated successfully!
              </div>
            )}

            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 rounded-sm text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                {saveError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                  Full Athlete Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-neutral-300 disabled:bg-neutral-50 disabled:text-neutral-500 rounded px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                  Email Address (Primary Account Key)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-neutral-100 border border-neutral-300 rounded px-3 py-2 text-xs text-neutral-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Email is locked to protect athlete order history.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                  Mobile Number (10 digits)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-2.5 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l text-xs font-bold text-neutral-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    maxLength={10}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full bg-white border border-neutral-300 disabled:bg-neutral-50 disabled:text-neutral-500 rounded-r px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-neutral-950 hover:bg-red-600 text-white rounded text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(user.name || '');
                      setEditPhone(user.phone || '');
                      setSaveError('');
                    }}
                    className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-xs font-bold uppercase transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
