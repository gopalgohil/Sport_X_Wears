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
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  Home,
  Briefcase,
  Search,
  ExternalLink,
  Save,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { getMyOrders } from '../../../lib/api';
import { Order, AthleticSize } from '../../../types';
import { formatPrice } from '../../../lib/utils';
import Navbar from '../../../components/common/Navbar';
import Footer from '../../../components/common/Footer';

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading, logout, updateProfile } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'security'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all');

  // Edit Profile State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Add/Manage Address State
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('Maharashtra');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newAddressType, setNewAddressType] = useState<'home' | 'work'>('home');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressMessage, setAddressMessage] = useState('');

  // Toast feedback
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
    }
  }, [user]);

  // Fetch live orders
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
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim() || !newCity.trim() || !newPostalCode.trim()) {
      setAddressMessage('Please fill all required address fields.');
      return;
    }

    setIsSavingAddress(true);
    setAddressMessage('');
    try {
      const updatedAddresses = [
        {
          street: newStreet.trim(),
          city: newCity.trim(),
          state: newState.trim(),
          postalCode: newPostalCode.trim(),
          addressType: newAddressType,
          isDefault: (user?.addresses?.length || 0) === 0,
        },
        ...(user?.addresses || []),
      ];

      await updateProfile({ addresses: updatedAddresses });
      setShowAddAddressModal(false);
      setNewStreet('');
      setNewCity('');
      setNewPostalCode('');
      setAddressMessage('Address added successfully!');
      setTimeout(() => setAddressMessage(''), 3000);
    } catch (err: any) {
      setAddressMessage(err.message || 'Failed to add address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (indexToDelete: number) => {
    if (!user?.addresses) return;
    const filtered = user.addresses.filter((_, i) => i !== indexToDelete);
    try {
      await updateProfile({ addresses: filtered });
    } catch (err) {
      console.error('Failed to delete address', err);
    }
  };

  const handleSetDefaultAddress = async (selectedIndex: number) => {
    if (!user?.addresses) return;
    const updated = user.addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === selectedIndex,
    }));
    try {
      await updateProfile({ addresses: updated });
    } catch (err) {
      console.error('Failed to set default address', err);
    }
  };

  const handleBuyAgain = (item: any) => {
    const productObj = typeof item.product === 'object' ? item.product : null;
    if (!productObj) return;

    addToCart(productObj, (item.size as AthleticSize) || 'M', 1);
    setReorderSuccess(`Added "${item.title}" back to your bag!`);
    setTimeout(() => setReorderSuccess(null), 3000);
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
              Please sign in to view your live order history, delivery tracking, and manage your saved addresses.
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
              Don&apos;t have an account?{' '}
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

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = orderFilter === 'all' || order.orderStatus === orderFilter;
    const matchesSearch =
      orderSearchQuery === '' ||
      order._id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.title.toLowerCase().includes(orderSearchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f1f2f4] flex flex-col justify-between text-neutral-900">
      <Navbar />

      {/* Global Feedback Toast */}
      {reorderSuccess && (
        <div className="fixed top-24 right-4 z-50 bg-neutral-950 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 border border-neutral-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{reorderSuccess}</span>
        </div>
      )}

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Amazon/Flipkart Breadcrumb & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
              <Link href="/" className="hover:text-neutral-900">Home</Link>
              <span>/</span>
              <span className="text-neutral-900 font-semibold">Your Account</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
              YOUR ACCOUNT &amp; ORDERS
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                prefetch={false}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-lg transition-colors border border-red-700 shadow-sm flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-white hover:bg-red-50 hover:text-red-600 text-neutral-700 text-xs font-bold uppercase rounded-lg transition-colors border border-neutral-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Amazon-Style Quick Hub Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {/* Card 1: Your Orders */}
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`p-4 sm:p-5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-4 ${
              activeTab === 'orders'
                ? 'bg-white border-neutral-900 shadow-md ring-1 ring-neutral-900'
                : 'bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-xs'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-headline text-sm font-bold uppercase text-neutral-950">
                Your Orders
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Track, return, or buy items again ({orders.length} orders)
              </p>
            </div>
          </button>

          {/* Card 2: Saved Addresses */}
          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`p-4 sm:p-5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-4 ${
              activeTab === 'addresses'
                ? 'bg-white border-neutral-900 shadow-md ring-1 ring-neutral-900'
                : 'bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-xs'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-headline text-sm font-bold uppercase text-neutral-950">
                Saved Addresses
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Manage default delivery addresses for 1-click checkout
              </p>
            </div>
          </button>

          {/* Card 3: Login & Security */}
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`p-4 sm:p-5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-4 ${
              activeTab === 'security'
                ? 'bg-white border-neutral-900 shadow-md ring-1 ring-neutral-900'
                : 'bg-white border-neutral-200 hover:border-neutral-400 hover:shadow-xs'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-headline text-sm font-bold uppercase text-neutral-950">
                Login &amp; Profile
              </h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Edit profile name, mobile number, &amp; account info
              </p>
            </div>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: YOUR ORDERS (AMAZON & FLIPKART STYLE ORDER HISTORY)
           ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search orders by item name or Order ID..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'processing', 'shipped', 'delivered'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setOrderFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                      orderFilter === filterKey
                        ? 'bg-neutral-950 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {filterKey === 'all' ? 'All Orders' : filterKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Listing */}
            {isOrdersLoading ? (
              <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-3 shadow-xs">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Retrieving your live gear orders...
                </p>
              </div>
            ) : ordersError ? (
              <div className="bg-white rounded-xl border border-red-200 p-6 text-center space-y-2 text-red-600 text-xs shadow-xs">
                <AlertCircle className="w-6 h-6 mx-auto text-red-600" />
                <p className="font-bold">{ordersError}</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="font-headline text-lg sm:text-xl font-bold uppercase text-neutral-950">
                  NO ORDERS FOUND
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {orderSearchQuery
                    ? 'No orders match your search keyword. Try a different search.'
                    : "You haven't placed any orders yet. Discover our premium performance gear!"}
                </p>
                <Link
                  href="/#products-section"
                  className="inline-flex items-center gap-2 bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" /> EXPLORE PRODUCTS
                </Link>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isDelivered = order.orderStatus === 'delivered';
                const isShipped = order.orderStatus === 'shipped';

                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl border border-neutral-200/90 shadow-xs overflow-hidden transition-shadow hover:shadow-md"
                  >
                    {/* Order Card Header (Amazon Signature Style) */}
                    <div className="bg-neutral-50/90 px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-8 gap-y-2 text-neutral-600">
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
                            TOTAL AMOUNT
                          </span>
                          <span className="font-headline font-black text-neutral-950 text-sm">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase block">
                            SHIP TO
                          </span>
                          <span className="font-bold text-neutral-800 truncate block max-w-[140px]">
                            {order.customer?.name || user.name}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase block">
                            PAYMENT
                          </span>
                          <span className="font-semibold uppercase text-neutral-700 text-[11px]">
                            {order.paymentDetails?.method || 'COD'} ({order.paymentDetails?.status || 'Paid'})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200">
                        <span className="font-mono text-[11px] text-neutral-500 font-bold">
                          ORDER # {order._id.slice(-8).toUpperCase()}
                        </span>
                        <Link
                          href={`/order-success?orderId=${order._id}`}
                          className="text-red-600 hover:text-red-700 text-xs font-bold uppercase inline-flex items-center gap-1"
                        >
                          Invoice <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Order Delivery Status Header & Tracker Bar (Flipkart Style) */}
                    <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-neutral-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-headline text-sm sm:text-base font-extrabold uppercase text-neutral-950 flex items-center gap-2">
                            {isDelivered ? (
                              <span className="text-emerald-700 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Delivered Successfully
                              </span>
                            ) : isShipped ? (
                              <span className="text-blue-700 flex items-center gap-1.5">
                                <Truck className="w-4 h-4 text-blue-600" /> Out for Delivery / In Transit
                              </span>
                            ) : (
                              <span className="text-amber-700 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-600" /> Order Confirmed &amp; Processing
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            Delivery Address: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                          </p>
                        </div>
                      </div>

                      {/* 4-Step Progress Tracker */}
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider mb-2">
                        <div className="flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1">
                            ✓
                          </div>
                          <span className="text-emerald-700">Confirmed</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 ${
                            order.orderStatus === 'processing' || isShipped || isDelivered
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-200 text-neutral-500'
                          }`}>
                            ✓
                          </div>
                          <span className={order.orderStatus === 'processing' || isShipped || isDelivered ? 'text-emerald-700' : 'text-neutral-400'}>
                            Processing
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 ${
                            isShipped || isDelivered
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-200 text-neutral-500'
                          }`}>
                            {isShipped || isDelivered ? '✓' : '3'}
                          </div>
                          <span className={isShipped || isDelivered ? 'text-blue-700' : 'text-neutral-400'}>
                            Shipped
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 ${
                            isDelivered
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-200 text-neutral-500'
                          }`}>
                            {isDelivered ? '✓' : '4'}
                          </div>
                          <span className={isDelivered ? 'text-emerald-700' : 'text-neutral-400'}>
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="p-4 sm:p-6 divide-y divide-neutral-100">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="relative w-18 h-22 sm:w-20 sm:h-24 bg-neutral-100 rounded-lg border border-neutral-200 overflow-hidden shrink-0">
                              <Image
                                src={
                                  item.image ||
                                  (typeof item.product === 'object' && item.product?.images?.[0]) ||
                                  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
                                }
                                alt={item.title}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h5 className="font-headline text-xs sm:text-sm font-bold uppercase text-neutral-950 line-clamp-1">
                                {item.title}
                              </h5>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500 font-semibold">
                                <span className="bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 text-neutral-800">
                                  Size: {item.size}
                                </span>
                                <span>Qty: {item.quantity}</span>
                              </div>
                              <p className="font-headline text-sm sm:text-base font-black text-neutral-950 mt-1">
                                {formatPrice(item.priceAtPurchase * item.quantity)}
                              </p>
                            </div>
                          </div>

                          {/* Action Button: Buy It Again (Amazon Feature) */}
                          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleBuyAgain(item)}
                              className="w-full sm:w-auto px-4 py-2 bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> BUY IT AGAIN
                            </button>
                            <Link
                              href={typeof item.product === 'object' ? `/products/${item.product?.slug || item.product?._id}` : '/'}
                              className="text-[11px] text-neutral-600 hover:text-red-600 font-semibold"
                            >
                              View Product
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: SAVED ADDRESSES (FLIPKART & AMAZON STYLE MANAGE ADDRESSES)
           ========================================================================= */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <div>
                <h3 className="font-headline text-base font-bold uppercase text-neutral-950">
                  Your Saved Addresses
                </h3>
                <p className="text-xs text-neutral-500">
                  Manage your delivery addresses for seamless 1-click orders.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddAddressModal(true)}
                className="px-4 py-2.5 bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            </div>

            {addressMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                {addressMessage}
              </div>
            )}

            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className={`bg-white rounded-xl p-5 border transition-all relative ${
                      addr.isDefault
                        ? 'border-neutral-900 shadow-md ring-1 ring-neutral-900'
                        : 'border-neutral-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-neutral-100 text-neutral-800 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-neutral-200 flex items-center gap-1">
                          {addr.addressType === 'work' ? (
                            <>
                              <Briefcase className="w-3 h-3" /> WORK
                            </>
                          ) : (
                            <>
                              <Home className="w-3 h-3" /> HOME
                            </>
                          )}
                        </span>
                        {addr.isDefault && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                            DEFAULT
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteAddress(idx)}
                        className="text-neutral-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-bold text-sm text-neutral-900">{user.name}</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      {addr.street}
                      <br />
                      {addr.city}, {addr.state || 'Maharashtra'} - {addr.postalCode}
                      <br />
                      Phone: +91 {user.phone || '9876543210'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(idx)}
                          className="text-red-600 hover:underline font-bold text-[11px] cursor-pointer"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-white rounded-xl border border-dashed border-neutral-300 p-12 text-center space-y-3">
                  <MapPin className="w-8 h-8 mx-auto text-neutral-400" />
                  <h4 className="font-headline text-base font-bold uppercase text-neutral-800">
                    No Addresses Saved Yet
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Add your shipping address now to enable rapid 1-click checkout on your next athletic gear order.
                  </p>
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Your First Address
                  </button>
                </div>
              )}
            </div>

            {/* Modal: Add Address */}
            {showAddAddressModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-neutral-200 space-y-4 animate-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h3 className="font-headline text-lg font-black uppercase text-neutral-950">
                      ADD NEW DELIVERY ADDRESS
                    </h3>
                    <button
                      onClick={() => setShowAddAddressModal(false)}
                      className="text-neutral-400 hover:text-neutral-900 text-xl font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleAddNewAddress} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                        Street / Building / Flat *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="House No, Landmark, Street"
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Mumbai"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="400001"
                          value={newPostalCode}
                          onChange={(e) => setNewPostalCode(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                        Address Type
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewAddressType('home')}
                          className={`flex-1 py-1.5 text-xs font-bold rounded border cursor-pointer ${
                            newAddressType === 'home'
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'bg-white text-neutral-700 border-neutral-300'
                          }`}
                        >
                          Home (All Day)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewAddressType('work')}
                          className={`flex-1 py-1.5 text-xs font-bold rounded border cursor-pointer ${
                            newAddressType === 'work'
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'bg-white text-neutral-700 border-neutral-300'
                          }`}
                        >
                          Work (10 AM - 5 PM)
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAddressModal(false)}
                        className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs uppercase rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingAddress}
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {isSavingAddress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Address'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: LOGIN & PROFILE SECURITY
           ========================================================================= */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="font-headline text-lg font-black uppercase text-neutral-950">
                Personal Information &amp; Account Settings
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Update your athlete profile details used for orders and shipping communications.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Athlete Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Primary Mobile Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-lg text-xs font-bold text-neutral-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-white border rounded-r-lg px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Email Address (Primary Login ID)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-neutral-100 border border-neutral-200 rounded-lg px-3.5 py-2.5 text-xs text-neutral-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Email address cannot be changed directly for security reasons.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-neutral-950 hover:bg-red-600 text-white font-headline text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:bg-neutral-400"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
