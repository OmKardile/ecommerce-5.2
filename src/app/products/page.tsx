import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Badge } from '@/components/ui/Badge';
import {
  getFilteredProducts,
  getAllCategoriesFlat,
  getPopularBrands,
} from '@/server/services/catalog.service';
import { Filter, X, SlidersHorizontal, Check } from 'lucide-react';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const categorySlug = params.category;
  const brandSlug = params.brand;
  const searchQuery = params.search;
  const inStockOnly = params.inStock === 'true';
  const sortBy = (params.sort as any) || 'featured';

  const [products, categories, brands] = await Promise.all([
    getFilteredProducts({
      categorySlug,
      brandSlug,
      search: searchQuery,
      inStockOnly,
      sortBy,
    }),
    getAllCategoriesFlat(),
    getPopularBrands(),
  ]);

  const hasActiveFilters = !!(categorySlug || brandSlug || searchQuery || inStockOnly);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <nav className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Catalog</span>
            {categorySlug && (
              <>
                <span>/</span>
                <span className="text-sky-600 dark:text-sky-400 capitalize">
                  {categorySlug.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : categorySlug
                  ? categories.find((c) => c.slug === categorySlug)?.name || 'Category Products'
                  : brandSlug
                  ? `${brands.find((b) => b.slug === brandSlug)?.name || 'Brand'} Hardware`
                  : 'All Surveillance & Security Products'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Showing {products.length} genuine commercial hardware items
              </p>
            </div>

            {/* Clear filters badge if active */}
            {hasActiveFilters && (
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline"
              >
                <X className="w-3.5 h-3.5" /> Clear All Filters
              </Link>
            )}
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* ============================================================ */}
          {/* FILTER SIDEBAR */}
          {/* ============================================================ */}
          <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-500" /> Filter Hardware
              </span>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
                Category
              </h4>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <Link
                  href={`/products${brandSlug ? `?brand=${brandSlug}` : ''}`}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    !categorySlug
                      ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>All Categories</span>
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}${brandSlug ? `&brand=${brandSlug}` : ''}`}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      categorySlug === cat.slug
                        ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-slate-400">({cat._count.products})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
                Brand
              </h4>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <Link
                  href={`/products${categorySlug ? `?category=${categorySlug}` : ''}`}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    !brandSlug
                      ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>All Brands</span>
                </Link>
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/products?brand=${b.slug}${categorySlug ? `&category=${categorySlug}` : ''}`}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      brandSlug === b.slug
                        ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-[10px] text-slate-400">({b._count.products})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href={`/products?${new URLSearchParams({
                  ...(categorySlug && { category: categorySlug }),
                  ...(brandSlug && { brand: brandSlug }),
                  ...(searchQuery && { search: searchQuery }),
                  inStock: inStockOnly ? 'false' : 'true',
                }).toString()}`}
                className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    inStockOnly
                      ? 'bg-sky-600 border-sky-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}
                >
                  {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>In-Stock Items Only</span>
              </Link>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* PRODUCT GRID */}
          {/* ============================================================ */}
          <div className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No matching surveillance products
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Try clearing some filters or searching with different terms like &quot;4MP&quot;, &quot;Hikvision&quot;, or &quot;DVR&quot;.
                </p>
                <Link
                  href="/products"
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs shadow-xs"
                >
                  View All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
