'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, TrendingUp, ArrowUpRight, Sparkles, Tag, ShoppingBag } from 'lucide-react';
import { Product, Category } from '../../types';
import { getProducts, getCategories } from '../../lib/api';

interface SearchSuggestion {
  label: string;
  subtitle?: string;
  queryToRun: string;
  type: 'category' | 'product' | 'keyword';
  badge?: string;
}

interface SearchBarProps {
  onSearchSubmit?: (query: string) => void;
  className?: string;
  isMobileFullWidth?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearchSubmit,
  className = '',
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial search from URL params if available on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get('search');
      if (urlSearch) {
        setQuery(urlSearch);
      }
    }
  }, []);

  // Fetch dynamic categories
  useEffect(() => {
    async function loadDynamicCategories() {
      try {
        const res = await getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories in search:', err);
      }
    }
    loadDynamicCategories();
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sportxwear_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Handle outside click to close suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query suggestion & product matching
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setMatchedProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      const trimmed = query.trim().toLowerCase();

      // 1. Dynamic category suggestions
      const matchingCats = categories
        .filter((cat) => cat.name.toLowerCase().includes(trimmed) || (cat.description && cat.description.toLowerCase().includes(trimmed)))
        .map((cat) => ({
          label: cat.name,
          subtitle: `Category • ${cat.description ? cat.description.slice(0, 40) + '...' : 'Athletic Gear'}`,
          queryToRun: cat.name,
          type: 'category' as const,
          badge: 'Category',
        }));

      setSuggestions(matchingCats.slice(0, 5));

      // 2. Fetch live matching products from API
      try {
        const res = await getProducts({ search: query.trim(), limit: 4 });
        if (res.success && res.data) {
          setMatchedProducts(res.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Search preview error:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, categories]);

  const saveRecentSearch = (term: string) => {
    try {
      const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('sportxwear_recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleExecuteSearch = (searchTerm: string) => {
    const finalQuery = searchTerm.trim();
    if (!finalQuery) return;

    setQuery(finalQuery);
    saveRecentSearch(finalQuery);
    setIsOpen(false);

    if (onSearchSubmit) {
      onSearchSubmit(finalQuery);
    } else {
      router.push(`/?search=${encodeURIComponent(finalQuery)}#products-section`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteSearch(query);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setMatchedProducts([]);
    if (onSearchSubmit) {
      onSearchSubmit('');
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center w-full group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search"
          aria-label="Search products, brands and categories"
          className="w-full pl-4 sm:pl-4.5 pr-14 sm:pr-16 py-2 sm:py-2.5 bg-neutral-100 hover:bg-neutral-100/90 focus:bg-white text-neutral-900 placeholder:text-neutral-500 text-xs sm:text-sm font-medium border border-neutral-200 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 rounded-full sm:rounded-lg transition-all shadow-xs outline-none"
        />

        {/* Right Action Icons (Clear X and Search Magnifying Icon) */}
        <div className="absolute right-2 sm:right-3 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleExecuteSearch(query)}
            className="p-1.5 text-neutral-400 hover:text-red-600 group-focus-within:text-red-600 transition-colors cursor-pointer flex items-center justify-center rounded-full hover:bg-neutral-200/60"
            aria-label="Submit search"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      </div>

      {/* =========================================================
          Amazon / Flipkart Style Live Suggestions & Preview Dropdown
         ========================================================= */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto">
          {/* 1. When Search query is empty: Show Trending & Recent Searches */}
          {!query.trim() && (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    <span>Recent Searches</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem('sportxwear_recent_searches');
                      }}
                      className="text-[10px] text-red-600 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleExecuteSearch(term);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-full transition-colors cursor-pointer"
                      >
                        <Search className="w-3 h-3 text-neutral-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {categories.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                    <span>Popular Gear Categories</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleExecuteSearch(cat.name);
                        }}
                        onClick={() => {
                          handleExecuteSearch(cat.name);
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-md bg-neutral-100 group-hover:bg-red-50 text-neutral-600 group-hover:text-red-600 flex items-center justify-center shrink-0 transition-colors">
                            <Tag className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-800 group-hover:text-red-600 truncate transition-colors">
                              {cat.name}
                            </p>
                            {cat.description && (
                              <p className="text-[10px] text-neutral-400 truncate">{cat.description}</p>
                            )}
                          </div>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-red-600 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. When Search query is active: Show Live Keyword Matches & Product Preview */}
          {query.trim() && (
            <div>
              {/* Keyword suggestions list */}
              {suggestions.length > 0 && (
                <div className="py-1 border-b border-neutral-100">
                  <div className="px-3 py-1.5 text-[10px] font-headline font-bold uppercase tracking-widest text-neutral-400">
                    Search Suggestions
                  </div>
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleExecuteSearch(sug.queryToRun);
                      }}
                      onClick={() => {
                        handleExecuteSearch(sug.queryToRun);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 text-left transition-colors cursor-pointer group border-b border-neutral-50 last:border-none"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-600 transition-colors shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm text-neutral-800 font-bold group-hover:text-red-600 block truncate">
                            {sug.label}
                          </span>
                          {sug.subtitle && (
                            <span className="text-[10px] text-neutral-400 block truncate">
                              {sug.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                      {sug.badge && (
                        <span className="text-[9px] font-headline font-extrabold uppercase px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded group-hover:bg-red-50 group-hover:text-red-600 transition-colors shrink-0 ml-2">
                          {sug.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Live Matching Product Cards */}
              {matchedProducts.length > 0 && (
                <div className="p-3 bg-neutral-50/50">
                  <div className="flex items-center justify-between text-[10px] font-headline font-bold uppercase tracking-widest text-neutral-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-red-600" />
                      Matching Products ({matchedProducts.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedProducts.map((prod) => (
                      <button
                        key={prod._id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleExecuteSearch(prod.title);
                        }}
                        onClick={() => {
                          handleExecuteSearch(prod.title);
                        }}
                        className="flex items-center gap-3 p-2 bg-white hover:bg-neutral-100/80 border border-neutral-200 rounded-lg text-left transition-all cursor-pointer group"
                      >
                        <div className="relative w-12 h-12 bg-neutral-100 rounded-md overflow-hidden shrink-0 border border-neutral-100">
                          {prod.images && prod.images[0] ? (
                            <Image
                              src={prod.images[0]}
                              alt={prod.title}
                              fill
                              sizes="48px"
                              className="object-cover object-center group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                              <ShoppingBag className="w-4 h-4 text-neutral-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-neutral-900 group-hover:text-red-600 truncate transition-colors">
                            {prod.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-extrabold text-neutral-950 font-headline">
                              ₹{(prod.discountPrice || prod.price).toLocaleString('en-IN')}
                            </span>
                            {prod.discountPrice && (
                              <span className="text-[10px] text-neutral-400 line-through">
                                ₹{prod.price.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom "See all results" CTA */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleExecuteSearch(query);
                }}
                onClick={() => handleExecuteSearch(query)}
                className="w-full py-2.5 px-4 bg-neutral-950 hover:bg-red-600 text-white text-xs font-headline font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>See all results for &quot;{query}&quot;</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
