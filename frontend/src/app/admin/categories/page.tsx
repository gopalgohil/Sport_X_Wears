'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Check,
  AlertCircle,
  X,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { Category } from '@/types';
import { getCategories, createCategoryAdmin } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminCategoriesPage() {
  const { token } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add category modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [newCatBanner, setNewCatBanner] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      if (res?.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setError('Please provide a category name');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await createCategoryAdmin(
        {
          name: newCatName.trim(),
          description: newCatDescription.trim(),
          bannerImage: newCatBanner.trim() || undefined,
        },
        token
      );

      setSuccess(`Category "${newCatName}" created successfully!`);
      setNewCatName('');
      setNewCatDescription('');
      setNewCatBanner('');
      setShowAddModal(false);
      await fetchCats();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-headline text-white tracking-wide">
            CATALOG CATEGORIES
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Organize athletic apparel and sport gear collections.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-900/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm font-medium flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 text-sm"
          />
        </div>

        <button
          onClick={() => fetchCats()}
          className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-neutral-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-2" />
            <p>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full py-16 text-center text-neutral-500 space-y-2">
            <FolderTree className="w-8 h-8 mx-auto opacity-40" />
            <p className="font-semibold text-neutral-300">No categories found</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category._id}
              className="rounded-2xl bg-neutral-900/90 border border-neutral-800 overflow-hidden shadow-xl flex flex-col group hover:border-neutral-700 transition-colors"
            >
              {/* Category banner / preview */}
              <div className="h-32 bg-neutral-950 relative overflow-hidden flex items-center justify-center border-b border-neutral-800">
                {category.bannerImage ? (
                  <img
                    src={category.bannerImage}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Layers className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      SPORT X WEAR
                    </span>
                  </div>
                )}
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  Active
                </span>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold font-headline text-lg text-white">
                    {category.name}
                  </h3>
                  <p className="text-xs font-mono text-red-500 mt-0.5">
                    /{category.slug}
                  </p>
                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                    {category.description || 'Athletic performance collection.'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-neutral-950 border border-neutral-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-white text-lg">Create New Category</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Gym Sleeveless Hoodies"
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newCatDescription}
                  onChange={(e) => setNewCatDescription(e.target.value)}
                  placeholder="High-performance breathable apparel..."
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1.5">
                  Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={newCatBanner}
                  onChange={(e) => setNewCatBanner(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-900/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
