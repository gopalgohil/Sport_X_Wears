'use client';

import React, { useState } from 'react';
import { ArrowUpDown, SlidersHorizontal, X, Check } from 'lucide-react';

interface ProductFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  resultsCount: number;
}

const SIZE_OPTIONS = ['ALL', 'S', 'M', 'L', 'XL', 'XXL'];

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured / Recommended' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest Drops First' },
];

export const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedSize,
  onSelectSize,
  sortBy,
  onSortChange,
  resultsCount,
}) => {
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Temporary state for the filter modal before "Apply" is clicked
  const [tempCategory, setTempCategory] = useState(selectedCategory);
  const [tempSize, setTempSize] = useState(selectedSize);

  const activeFiltersCount = (selectedSize !== 'ALL' ? 1 : 0) + (selectedCategory !== 'ALL GEAR' ? 1 : 0);

  const handleOpenFilterModal = () => {
    setTempCategory(selectedCategory);
    setTempSize(selectedSize);
    setShowFilterModal(true);
  };

  const handleApplyFilters = () => {
    onSelectCategory(tempCategory);
    onSelectSize(tempSize);
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    setTempCategory('ALL GEAR');
    setTempSize('ALL');
    onSelectCategory('ALL GEAR');
    onSelectSize('ALL');
    setShowFilterModal(false);
  };

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Featured';

  return (
    <div className="w-full mb-8">
      {/* ====================================================================
          1. MOBILE FLIPKART / AMAZON STYLE FILTER BAR (Visible on screens < 768px)
          ==================================================================== */}
      <div className="block md:hidden bg-white border border-neutral-200 shadow-xs mb-4">
        {/* Horizontal Category Scroll Chips (Like Flipkart/Amazon Category Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto px-3 py-2.5 scrollbar-none border-b border-neutral-100">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`shrink-0 font-headline text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 transition-all cursor-pointer whitespace-nowrap rounded-none border ${
                  isSelected
                    ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 2-Column Action Bar: [ ⇅ Sort ] | [ ⚙ Filter ] */}
        <div className="grid grid-cols-2 divide-x divide-neutral-200 text-center">
          {/* Sort Button */}
          <button
            type="button"
            onClick={() => setShowSortModal(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 font-headline text-xs font-black uppercase tracking-wider text-neutral-900 active:bg-neutral-100 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-600" />
            <span>SORT</span>
          </button>

          {/* Filter Button */}
          <button
            type="button"
            onClick={handleOpenFilterModal}
            className="flex items-center justify-center gap-2 py-3 px-4 font-headline text-xs font-black uppercase tracking-wider text-neutral-900 active:bg-neutral-100 transition-colors cursor-pointer relative"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
            <span>FILTER</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Chips (if any filter is selected) */}
        {(selectedSize !== 'ALL' || selectedCategory !== 'ALL GEAR') && (
          <div className="flex items-center gap-2 flex-wrap px-3 py-2 bg-neutral-50 border-t border-neutral-100">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase">
              Applied:
            </span>
            {selectedCategory !== 'ALL GEAR' && (
              <span
                onClick={() => onSelectCategory('ALL GEAR')}
                className="inline-flex items-center gap-1 bg-white border border-neutral-300 text-neutral-800 text-[11px] font-bold px-2 py-0.5 cursor-pointer hover:border-red-600"
              >
                {selectedCategory}
                <X className="w-3 h-3 text-neutral-400 hover:text-red-600" />
              </span>
            )}
            {selectedSize !== 'ALL' && (
              <span
                onClick={() => onSelectSize('ALL')}
                className="inline-flex items-center gap-1 bg-white border border-neutral-300 text-neutral-800 text-[11px] font-bold px-2 py-0.5 cursor-pointer hover:border-red-600"
              >
                Size: {selectedSize}
                <X className="w-3 h-3 text-neutral-400 hover:text-red-600" />
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-bold text-red-600 uppercase underline ml-auto"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* ====================================================================
          2. DESKTOP FILTER BAR (Visible on screens >= 768px)
          ==================================================================== */}
      <div className="hidden md:block bg-white border-y border-neutral-200 py-4 px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`font-headline text-sm font-bold tracking-wider uppercase px-4 py-2 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-950 text-white border-neutral-950'
                      : 'bg-white text-neutral-600 border-transparent hover:border-neutral-300 hover:text-neutral-950'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Right Section: Sort Dropdown & Count */}
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {resultsCount} ITEMS
            </span>

            <div className="flex items-center gap-2 border border-neutral-300 px-3 py-1.5 bg-white">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="font-headline text-xs font-bold uppercase tracking-wider text-neutral-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Quick Size Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
          <span className="font-headline text-xs font-bold tracking-wider uppercase text-neutral-400 shrink-0 mr-2">
            FILTER BY SIZE:
          </span>
          {SIZE_OPTIONS.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                onClick={() => onSelectSize(size)}
                className={`min-w-8 h-8 px-2.5 font-headline text-xs font-bold uppercase transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-950 text-white border-neutral-950'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-900 hover:text-neutral-900'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          3. FLIPKART-STYLE SORT BOTTOM SHEET MODAL (Mobile)
          ==================================================================== */}
      {showSortModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowSortModal(false)}
          />

          {/* Bottom Sheet Box */}
          <div className="relative bg-white w-full rounded-t-2xl p-5 shadow-2xl z-10 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="font-headline text-base font-black uppercase tracking-wider text-neutral-950">
                SORT BY
              </h3>
              <button
                onClick={() => setShowSortModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSortChange(opt.id);
                      setShowSortModal(false);
                    }}
                    className={`w-full flex items-center justify-between py-3.5 px-3 text-left font-headline text-sm font-bold uppercase transition-colors rounded-xs ${
                      isSelected
                        ? 'text-red-600 bg-red-50/70 font-black'
                        : 'text-neutral-800 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-red-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          4. FLIPKART-STYLE FILTER BOTTOM SHEET MODAL (Mobile)
          ==================================================================== */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowFilterModal(false)}
          />

          {/* Bottom Sheet Box */}
          <div className="relative bg-white w-full rounded-t-2xl shadow-2xl z-10 flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-red-600" />
                <h3 className="font-headline text-base font-black uppercase tracking-wider text-neutral-950">
                  FILTERS
                </h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-5 space-y-6 overflow-y-auto flex-1">
              {/* Category Filter */}
              <div>
                <p className="font-headline text-xs font-black uppercase tracking-wider text-neutral-950 mb-3">
                  DISCIPLINE / CATEGORY
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = tempCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setTempCategory(cat)}
                        className={`py-2.5 px-3 font-headline text-xs font-bold uppercase border transition-all text-center ${
                          isSelected
                            ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <p className="font-headline text-xs font-black uppercase tracking-wider text-neutral-950 mb-3">
                  SELECT ATHLETIC SIZE
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {SIZE_OPTIONS.map((size) => {
                    const isSelected = tempSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setTempSize(size)}
                        className={`h-11 font-headline text-sm font-bold uppercase border transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'bg-white text-neutral-800 border-neutral-300'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Clear & Apply (Flipkart sticky bottom style) */}
            <div className="p-4 border-t border-neutral-200 bg-white grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="py-3 px-4 border border-neutral-300 text-neutral-900 font-headline text-sm font-bold uppercase tracking-wider hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
              >
                CLEAR ALL
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="py-3 px-4 bg-red-600 text-white font-headline text-sm font-bold uppercase tracking-wider hover:bg-red-700 active:bg-red-800 transition-colors shadow-md"
              >
                APPLY FILTERS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;
