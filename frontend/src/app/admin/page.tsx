'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  FolderTree,
  ExternalLink,
} from 'lucide-react';
import { getProducts, getCategories, getAllOrdersAdmin } from '@/lib/api';
import { Product, Category, Order } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
  const { token, user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [prodRes, catRes, orderRes] = await Promise.all([
          getProducts({ limit: 50 }),
          getCategories(),
          getAllOrdersAdmin({ limit: 10 }, token).catch(() => ({ data: [], total: 0 })),
        ]);

        if (prodRes?.data) setProducts(prodRes.data);
        if (catRes?.data) setCategories(catRes.data);
        if (orderRes?.data) setOrders(orderRes.data);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [token]);

  // Derived metrics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const lowStockProducts = products.filter((p) => p.stock < 10);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-red-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Management HQ
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-headline text-white tracking-wide">
              WELCOME BACK, {user?.name?.toUpperCase() || 'CHAMPION'}
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">
              Monitor real-time athletic inventory, process athlete orders, and manage high-performance gear catalog.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/products/add"
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-900/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </Link>

            <Link
              href="/admin/orders"
              className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm border border-neutral-700 transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Total Products
            </p>
            <h3 className="text-3xl font-black font-headline text-white mt-2">
              {loading ? '...' : totalProducts}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              {categories.length} active categories
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Total Orders
            </p>
            <h3 className="text-3xl font-black font-headline text-white mt-2">
              {loading ? '...' : totalOrders}
            </h3>
            <p className="text-xs text-emerald-400 font-medium mt-1">
              Active pipeline
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Gross Volume
            </p>
            <h3 className="text-3xl font-black font-headline text-emerald-400 mt-2">
              ₹{loading ? '...' : totalRevenue.toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">Processed orders</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Low Stock Alerts
            </p>
            <h3 className="text-3xl font-black font-headline text-amber-400 mt-2">
              {loading ? '...' : lowStockProducts.length}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">Requires restock</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl bg-neutral-900/90 border border-neutral-800 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <h2 className="font-bold text-white text-base">Recent Customer Orders</h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-neutral-800/60">
            {loading ? (
              <div className="p-12 text-center text-neutral-500 text-sm">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-sm font-semibold text-neutral-400">
                  No orders recorded yet
                </p>
                <p className="text-xs text-neutral-500">
                  New orders from athletes will appear here in real-time.
                </p>
              </div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-400 font-bold text-xs">
                      #{order._id.slice(-4).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {order.customer?.name}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {order.items?.length} items • ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        order.orderStatus === 'delivered'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : order.orderStatus === 'shipped'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : order.orderStatus === 'cancelled'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {order.orderStatus}
                    </span>

                    <Link
                      href="/admin/orders"
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Watchlist (1 Column) */}
        <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 overflow-hidden shadow-xl flex flex-col">
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h2 className="font-bold text-white text-base">Inventory Watchlist</h2>
            </div>
            <Link
              href="/admin/products"
              className="text-xs text-neutral-400 hover:text-white font-semibold"
            >
              Catalog
            </Link>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[380px]">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="text-sm font-semibold text-neutral-300">
                  Stock levels optimal!
                </p>
                <p className="text-xs text-neutral-500">
                  No products are currently under 10 units.
                </p>
              </div>
            ) : (
              lowStockProducts.slice(0, 6).map((product) => (
                <div
                  key={product._id}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        product.images?.[0] ||
                        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={product.title}
                      className="w-10 h-10 rounded-lg object-cover border border-neutral-800 shrink-0"
                    />
                    <div className="min-w-0 truncate">
                      <p className="text-xs font-bold text-white truncate">
                        {product.title}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        ₹{product.discountPrice || product.price}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-md shrink-0">
                    {product.stock} left
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-neutral-800 bg-neutral-950/50">
            <Link
              href="/admin/products/add"
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stock / Product</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
