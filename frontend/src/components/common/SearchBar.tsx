'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Search, X, TrendingUp, ArrowUpRight, Sparkles, Tag, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { getProducts } from '../../lib/api';

// Popular initial suggestions
const POPULAR_SUGGESTIONS = [
  { label: 'Sports T-Shirts', category: 'Sports T-Shirts', type: 'category' },
  { label: 'Sports Caps', category: 'Sports Caps', type: 'category' },
  { label: 'Track Pants & Joggers', category: 'Track Pants', type: 'category' },
  { label: 'AeroVent Mesh Tee', query: 'AeroVent', type: 'product' },
  { label: 'Apex Compression Top', query: 'Compression', type: 'product' },
  { label: 'Laser-Cut Performance Cap', query: 'Cap', type: 'product' },
  { label: 'Hydro-Wick Trucker Cap', query: 'Trucker Cap', type: 'product' },
  { label: 'Swift-Dry Training Shirt', query: 'Swift-Dry', type: 'product' },
];

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
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial search from URL params if available
  useEffect(() => {
    const urlSearch = searchParams?.get('search');
    if (urlSearch) {
      setQuery(urlSearch);
    }
  }, [searchParams]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sportxwear_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      // Ignore localStorage errors
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

      // 1. Generate Amazon/Flipkart keyword suggestions
      const keywordPool = [
        'sports t-shirts',
        'sports caps',
        'track pants',
        'compression top',
        'pro-vent mesh tee',
        'aerostrike laser-cut cap',
        'stealth hydro-wick cap',
        'swift-dry training shirt',
        'stormshield jogger',
        'endurance core tee',
        'gym t-shirt',
        'workout cap',
        'running pants',
      ];

      const matchedKeywords = keywordPool.filter((k) =>
        k.toLowerCase().includes(trimmed)
      );

      // Add category suggestion if relevant
      if ('caps'.includes(trimmed) || 'cap'.includes(trimmed)) {
        if (!matchedKeywords.includes('cap in Sports Caps')) {
          matchedKeywords.unshift('cap in Sports Caps');
        }
      }
      if ('tshirt'.includes(trimmed) || 't-shirt'.includes(trimmed) || 't shirt'.includes(trimmed) || 'tee'.includes(trimmed)) {
        if (!matchedKeywords.includes('t-shirt in Sports T-Shirts')) {
          matchedKeywords.unshift('t-shirt in Sports T-Shirts');
        }
      }
      if ('pant'.includes(trimmed) || 'jogger'.includes(trimmed) || 'track'.includes(trimmed)) {
        if (!matchedKeywords.includes('track pants in Track Pants')) {
          matchedKeywords.unshift('track pants in Track Pants');
        }
      }

      setSuggestions(Array.from(new Set(matchedKeywords)).slice(0, 5));

      // 2. Fetch live matching products
      try {
        const res = await getProducts({ search: query.trim(), limit: 4 });
        if (res.success && res.data) {
          setMatchedProducts(res.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Search preview error:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

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

    saveRecentSearch(finalQuery);
    setIsOpen(false);

    if (onSearchSubmit) {
      onSearchSubmit(finalQuery);
    } else {
      // Navigate to home products section with search query param
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
      {/* Search Input Box (Amazon / Flipkart Style) */}
      <div className="relative flex items-center w-full group">
        <div className="absolute left-3 sm:left-3.5 pointer-events-none flex items-center text-neutral-400 group-focus-within:text-red-600 transition-colors">
          <Search className="w-4 h-4" />
        </div>

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
          placeholder='Search "caps", "t-shirts", "track pants"...'
          aria-label="Search products, brands and categories"
          className="w-full pl-9 sm:pl-10 pr-16 sm:pr-24 py-2 sm:py-2 bg-neutral-100 hover:bg-neutral-100/90 focus:bg-white text-neutral-900 placeholder:text-neutral-500 text-xs sm:text-sm font-medium border border-neutral-200 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 rounded-full sm:rounded-lg transition-all shadow-inner outline-none"
        />

        {/* Right Action Icons (Clear button + Search Button) */}
        <div className="absolute right-1 sm:right-1.5 flex items-center gap-1">
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
            className="bg-neutral-950 hover:bg-red-600 text-white p-1.5 sm:px-3 sm:py-1 rounded-full sm:rounded text-[11px] font-headline font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
            aria-label="Submit search"
          >
            <Search className="w-3.5 h-3.5 sm:hidden" />
            <span className="hidden sm:inline">SEARCH</span>
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
                          setQuery(term);
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

              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-headline font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                  <span>Trending Categories & Gear</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {POPULAR_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const val = item.category || item.query || item.label;
                        setQuery(val);
                        handleExecuteSearch(val);
                      }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-neutral-100 group-hover:bg-red-50 text-neutral-600 group-hover:text-red-600 flex items-center justify-center shrink-0 transition-colors">
                          <Tag className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-neutral-800 group-hover:text-red-600 truncate transition-colors">
                          {item.label}
                        </span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-red-600 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
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
                      onClick={() => {
                        setQuery(sug);
                        handleExecuteSearch(sug);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 text-left transition-colors cursor-pointer group border-b border-neutral-50 last:border-none"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-600 transition-colors" />
                        <span className="text-xs sm:text-sm text-neutral-800 font-medium group-hover:text-red-600">
                          {sug}
                        </span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-red-600 transition-colors" />
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
