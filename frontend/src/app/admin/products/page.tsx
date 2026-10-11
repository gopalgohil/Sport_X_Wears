'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Package,
  Layers,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { Product, Category } from '@/types';
import { getProducts, getCategories, deleteProductAdmin } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminProductsPage() {
  const { token } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Deletion modal state
  const [deleteModalProduct, setDeleteModalProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts({ limit: 100 }), // admin view gets all
        getCategories(),
      ]);

      if (prodRes?.data) {
        setProducts(prodRes.data);
      }
      if (catRes?.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter products locally
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const catSlug = typeof p.category === 'object' ? p.category.slug : '';
    const matchesCategory =
      selectedCategory === 'ALL' || catSlug === selectedCategory;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && p.isActive) ||
      (statusFilter === 'INACTIVE' && !p.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPI calculations
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.isActive).length;
  const lowStockCount = products.filter((p) => p.stock < 10).length;

  // Handle Delete Confirmation
  const handleDelete = async (permanent: boolean = false) => {
    if (!deleteModalProduct) return;
    setIsDeleting(true);
    try {
      await deleteProductAdmin(deleteModalProduct._id, permanent, token);
      setActionMessage(
        permanent
          ? `Product "${deleteModalProduct.title}" permanently deleted.`
          : `Product "${deleteModalProduct.title}" deactivated.`
      );
      setDeleteModalProduct(null);
      await fetchData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Products */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-neutral-400">
              Total Products
            </p>
            <h3 className="text-3xl font-black font-headline text-white mt-1">
              {totalCount}
            </h3>
            <span className="text-[11px] text-neutral-500">In catalog</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Active on Storefront */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-neutral-400">
              Active in Store
            </p>
            <h3 className="text-3xl font-black font-headline text-emerald-400 mt-1">
              {activeCount}
            </h3>
            <span className="text-[11px] text-emerald-500/80">Visible to athletes</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-neutral-400">
              Low Stock Alert
            </p>
            <h3 className="text-3xl font-black font-headline text-amber-400 mt-1">
              {lowStockCount}
            </h3>
            <span className="text-[11px] text-amber-500/80">&lt; 10 units remaining</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm font-medium flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar & Add CTA */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-300 text-sm focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-300 text-sm focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Draft / Inactive</option>
          </select>

          <button
            onClick={() => fetchData()}
            title="Refresh"
            className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Add Product Button */}
        <Link
          href="/admin/products/add"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-900/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] uppercase tracking-wider font-bold text-neutral-400">
              <tr>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Sizes</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-2" />
                    <p>Loading inventory...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-neutral-300">No products found</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Try resetting filters or click "+ Add New Product"
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const categoryName =
                    typeof product.category === 'object'
                      ? product.category.name
                      : 'Apparel';
                  const primaryImage =
                    product.images?.[0] ||
                    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80';

                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-neutral-800/40 transition-colors group"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0">
                            <img
                              src={primaryImage}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate max-w-xs leading-tight">
                              {product.title}
                            </p>
                            <p className="text-xs text-neutral-500 font-mono truncate">
                              /{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-neutral-300 font-medium">
                        <span className="px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-xs">
                          {categoryName}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">
                            ₹{product.discountPrice || product.price}
                          </span>
                          {product.discountPrice ? (
                            <span className="text-[11px] line-through text-neutral-500">
                              ₹{product.price}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Sizes */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {product.sizes?.map((size) => (
                            <span
                              key={size}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-200">
                            {product.stock}
                          </span>
                          {product.stock <= 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-400">
                              Out
                            </span>
                          ) : product.stock < 10 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-400">
                              Low
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400">
                              In
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            product.isActive
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/80'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.isActive ? 'bg-emerald-400' : 'bg-neutral-500'
                            }`}
                          />
                          {product.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            title="View in Customer Store"
                            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/admin/products/${product._id}/edit`}
                            title="Edit Product"
                            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setDeleteModalProduct(product)}
                            title="Delete Product"
                            className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete / Deactivate Confirmation Modal */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-neutral-950 border border-neutral-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">
                  Manage Product Status
                </h3>
                <p className="text-xs text-neutral-400">Choose action for item</p>
              </div>
            </div>

            <p className="text-sm text-neutral-300">
              Are you sure you want to modify{' '}
              <strong className="text-white">"{deleteModalProduct.title}"</strong>?
            </p>

            <div className="space-y-2 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => handleDelete(false)}
                className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-semibold text-sm border border-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                <span>Deactivate (Hide from Storefront)</span>
              </button>

              <button
                disabled={isDeleting}
                onClick={() => handleDelete(true)}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-950/50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete From Database</span>
              </button>

              <button
                disabled={isDeleting}
                onClick={() => setDeleteModalProduct(null)}
                className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
