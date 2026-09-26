'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Shield,
  Search,
  ShoppingCart,
  User,
  Wrench,
  Menu,
  X,
  PhoneCall,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { getCartAction } from '@/app/actions/cart.actions';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { quickSearchAction } from '@/app/actions/catalog.actions';
import { formatInr } from '@/lib/utils';

interface HeaderUser {
  id: string;
  phone: string;
  customer?: {
    id: string;
    fullName?: string | null;
  } | null;
}

interface SearchSuggestion {
  id: string;
  name: string;
  slug: string;
  modelNumber: string | null;
  brandName: string;
  categoryName: string;
  imageUrl?: string | null;
  sellingPrice: number;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<HeaderUser | null>(null);

  // Live search autocomplete states
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const fetchCartCount = async () => {
    try {
      const cart = await getCartAction();
      setCartCount(cart?.itemCount ?? 0);
    } catch {
      // Graceful fallback
    }
  };

  const fetchUser = async () => {
    try {
      const res = await getCurrentUserAction();
      if (res.success && res.user) {
        setCurrentUser(res.user as HeaderUser);
      }
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    fetchCartCount();
    fetchUser();
    const onCartUpdate = () => {
      fetchCartCount();
      fetchUser();
    };
    window.addEventListener('cart-updated', onCartUpdate);
    return () => window.removeEventListener('cart-updated', onCartUpdate);
  }, []);

  // Debounced live search autocomplete
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await quickSearchAction(searchQuery.trim());
        if (res.success && res.data) {
          setSuggestions(res.data);
          setShowDropdown(true);
        }
      } catch {
        // Graceful fallback
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click-outside listener & Escape key handler to dismiss search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Genuine Hikvision, CP Plus & Dahua
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <FileText className="w-3.5 h-3.5 text-sky-400" /> B2B GST Tax Invoicing (18% ITC)
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Direct Dispatch Across India</span>
            <span>•</span>
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 text-slate-200 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> +91 98765 43210
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Patel Networks
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </span>
              <span className="block text-[10px] uppercase tracking-widest font-semibold text-sky-600 dark:text-sky-400 -mt-1">
                Security & Surveillance
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg relative items-center"
          >
            <div ref={searchContainerRef} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                placeholder="Search CCTV cameras, 4MP, DVRs, Cat6 cable, SKUs..."
                className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900 dark:text-white shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search query"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {showDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-1 text-left">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Searching surveillance hardware...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      <div className="p-2 text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50 dark:bg-slate-950/60 px-3">
                        Matching Hardware ({suggestions.length})
                      </div>
                      {suggestions.map((item) => (
                        <Link
                          key={item.id}
                          href={`/products/${item.slug}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center justify-between p-3 hover:bg-sky-50 dark:hover:bg-slate-800/80 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {item.brandName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 block line-clamp-1">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {item.modelNumber} • {item.categoryName}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-3">
                            {formatInr(item.sellingPrice)}
                          </span>
                        </Link>
                      ))}
                      <button
                        type="submit"
                        className="w-full py-2.5 px-3 text-center text-xs font-semibold text-sky-600 dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors block"
                      >
                        View all results for &quot;{searchQuery}&quot; →
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No matching products found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>

          {/* Navigation & CTAs */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/products"
              className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Browse Products
            </Link>

            {/* Custom CCTV Kit Builder CTA */}
            <Link
              href="/kit-builder"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-sky-500/15 hover:shadow-sky-500/25 hover:scale-[1.02] transition-all"
            >
              <Wrench className="w-3.5 h-3.5" />
              Custom CCTV Kit Builder
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Account / Login */}
            {currentUser ? (
              <Link
                href="/account"
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 flex items-center gap-2 text-xs font-semibold border border-sky-200 dark:border-sky-800 transition-all"
              >
                <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="hidden sm:inline">
                  Hi, {currentUser.customer?.fullName?.split(' ')[0] || 'Account'}
                </span>
              </Link>
            ) : (
              <Link
                href="/account/login"
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center gap-2 text-xs font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all"
              >
                <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="hidden sm:inline">Login / Account</span>
              </Link>
            )}

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 transition-all"
            >
              <ShoppingCart className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline">Cart</span>
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                {cartCount}
              </span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearch} className="relative w-full">
            <div ref={mobileSearchRef} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                placeholder="Search CCTV cameras, brands, SKUs..."
                className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Mobile Autocomplete Suggestions */}
              {showDropdown && suggestions.length > 0 && (
                <div className="mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 max-h-60 overflow-y-auto">
                  {suggestions.slice(0, 4).map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      onClick={() => {
                        setShowDropdown(false);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-between p-2.5 hover:bg-sky-50 dark:hover:bg-slate-800 text-xs"
                    >
                      <div className="truncate mr-2">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.brandName} • {formatInr(item.sellingPrice)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </form>

          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Browse All Products
            </Link>
            <Link
              href="/kit-builder"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" /> Custom CCTV Kit Builder
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Login with Phone OTP
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
