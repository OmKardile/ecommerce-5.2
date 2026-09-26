'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react';
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
      // graceful
    }
  };

  const fetchUser = async () => {
    try {
      const res = await getCurrentUserAction();
      if (res.success && res.user) {
        setCurrentUser(res.user as HeaderUser);
      }
    } catch {
      // graceful
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
        // graceful
      } finally {
        setIsSearching(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      if (event.key === 'Escape') setShowDropdown(false);
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
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-[2px] border-b border-border transition-colors">
      {/* Slim meta strip — restrained, monochrome, no icons clutter */}
      <div className="hidden md:block border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex justify-between items-center h-8 text-[11px] text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="dot-rec" aria-hidden />
              <span>Authorized distributor — CP Plus · Hikvision · Dahua</span>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden lg:inline">B2B GST invoicing · 18% ITC</span>
            <span className="hidden lg:inline text-stone-300 dark:text-stone-600">/</span>
            <a href="tel:+919876543210" className="link-underline hover:text-foreground transition-colors">
              +91 98765 43210
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-[68px] gap-6">
          {/* Logo lockup — editorial */}
          <Link href="/" className="flex items-baseline gap-2 shrink-0 group" aria-label="Patel Networks home">
            <span className="display text-[22px] sm:text-[26px] leading-none text-foreground">
              Patel<span className="text-[var(--ember)]">.</span>Networks
            </span>
            <span className="hidden sm:inline eyebrow text-stone-500 dark:text-stone-500 ml-1">
              Security Hardware
            </span>
          </Link>

          {/* Search — hairline input, sharp */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <div ref={searchContainerRef} className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                placeholder="Search cameras, recorders, cable, SKU…"
                className="w-full px-0 py-2 pr-8 text-sm bg-transparent border-0 border-b border-border focus:outline-none focus:border-foreground transition-colors placeholder:text-stone-400 text-foreground"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-0 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-foreground" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Autocomplete — clean, hairline, sharp */}
              {showDropdown && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-popover text-popover-foreground border border-border shadow-sm overflow-hidden z-50">
                  {isSearching ? (
                    <div className="p-5 text-xs text-stone-500">Searching…</div>
                  ) : suggestions.length > 0 ? (
                    <div>
                      <div className="eyebrow px-4 pt-3 pb-2 text-stone-400">
                        Matching hardware · {suggestions.length}
                      </div>
                      <div className="divide-y divide-border border-t border-border">
                        {suggestions.map((item) => (
                          <Link
                            key={item.id}
                            href={`/products/${item.slug}`}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-accent transition-colors group"
                          >
                            <div className="min-w-0">
                              <div className="text-sm text-foreground group-hover:text-[var(--ember)] transition-colors truncate">
                                {item.name}
                              </div>
                              <div className="text-[11px] text-stone-500 font-mono mt-0.5 truncate">
                                {item.brandName} · {item.modelNumber || item.categoryName}
                              </div>
                            </div>
                            <span className="text-sm font-mono text-foreground shrink-0">
                              {formatInr(item.sellingPrice)}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 px-4 text-left text-xs font-medium text-stone-600 hover:text-foreground hover:bg-accent transition-colors border-t border-border flex items-center justify-between"
                      >
                        <span>View all results for “{searchQuery}”</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-5 text-xs text-stone-500">No matching hardware.</div>
                  )}
                </div>
              )}
            </div>
          </form>

          {/* Nav + actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="hidden lg:flex items-center gap-6 mr-2">
              <Link
                href="/products"
                className="text-sm text-stone-700 dark:text-stone-300 hover:text-foreground link-underline transition-colors"
              >
                Catalog
              </Link>
              <Link
                href="/kit-builder"
                className="text-sm text-stone-700 dark:text-stone-300 hover:text-foreground link-underline transition-colors"
              >
                Kit Builder
              </Link>
            </nav>

            {/* Account */}
            {currentUser ? (
              <Link
                href="/account"
                className="px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:text-foreground border border-transparent hover:border-border transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {currentUser.customer?.fullName?.split(' ')[0] || 'Account'}
                </span>
              </Link>
            ) : (
              <Link
                href="/account/login"
                className="px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:text-foreground border border-transparent hover:border-border transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </Link>
            )}

            {/* Cart — minimal count, no pill */}
            <Link
              href="/cart"
              className="relative px-3 py-2 text-sm text-foreground hover:bg-accent border border-border hover:border-foreground transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="text-[var(--ember)] font-mono text-xs leading-none">
                  {String(cartCount).padStart(2, '0')}
                </span>
              )}
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-6 pt-4 pb-8 space-y-6">
          <form onSubmit={handleSearch} className="relative w-full">
            <div ref={mobileSearchRef} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
                placeholder="Search cameras, recorders, cable…"
                className="w-full px-0 py-3 text-sm bg-transparent border-0 border-b border-border focus:outline-none focus:border-foreground text-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {showDropdown && suggestions.length > 0 && (
                <div className="mt-2 bg-popover border border-border shadow-sm overflow-hidden divide-y divide-border max-h-72 overflow-y-auto">
                  {suggestions.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.slug}`}
                      onClick={() => { setShowDropdown(false); setMobileMenuOpen(false); }}
                      className="flex items-center justify-between p-3 hover:bg-accent text-sm"
                    >
                      <div className="truncate mr-3">
                        <div className="text-foreground truncate">{item.name}</div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          {item.brandName} · {formatInr(item.sellingPrice)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </form>

          <div className="flex flex-col divide-y divide-border border-y border-border">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="py-4 text-sm text-foreground flex items-center justify-between"
            >
              Browse Catalog <ArrowUpRight className="w-4 h-4 text-stone-400" />
            </Link>
            <Link
              href="/kit-builder"
              onClick={() => setMobileMenuOpen(false)}
              className="py-4 text-sm text-foreground flex items-center justify-between"
            >
              CCTV Kit Builder <ArrowUpRight className="w-4 h-4 text-stone-400" />
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="py-4 text-sm text-foreground flex items-center justify-between"
            >
              Login with Phone OTP <ArrowUpRight className="w-4 h-4 text-stone-400" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
