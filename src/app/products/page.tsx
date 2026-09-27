import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import {
  getFilteredProducts,
  getAllCategoriesFlat,
  getPopularBrands,
} from '@/server/services/catalog.service';
import { ArrowUpRight, Check } from 'lucide-react';
import { ProductsFilterDrawer } from '@/components/storefront/ProductsFilterDrawer';

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
  const sortBy = (params.sort as 'featured' | 'price_asc' | 'price_desc' | 'newest') || 'featured';

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

  const heading = searchQuery
    ? `"${searchQuery}"`
    : categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name || 'Catalog'
    : brandSlug
    ? `${brands.find((b) => b.slug === brandSlug)?.name || 'Brand'} Hardware`
    : 'Surveillance & Security Catalog';

  const activeCategoryName = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name
    : null;
  const activeBrandName = brandSlug
    ? brands.find((b) => b.slug === brandSlug)?.name
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-14">
        {/* Breadcrumb + heading */}
        <div className="mb-8">
          <nav className="text-[11px] text-stone-500 mb-3 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="text-stone-300 dark:text-stone-600">/</span>
            <span className="text-foreground">Catalog</span>
            {categorySlug && (
              <>
                <span className="text-stone-300 dark:text-stone-600">/</span>
                <span className="text-foreground capitalize">{categorySlug.replace(/-/g, ' ')}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="display text-[clamp(1.6rem,5vw,2.8rem)] leading-tight text-foreground break-words">
                {heading}
              </h1>
              <p className="text-sm text-stone-500 mt-2">
                {products.length} {products.length === 1 ? 'item' : 'items'} · genuine commercial hardware
              </p>
            </div>

            {hasActiveFilters && (
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-sm text-foreground link-underline shrink-0"
              >
                Clear filters <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile filter toggle — replaces the sidebar on small screens */}
        <div className="lg:hidden mb-6">
          <ProductsFilterDrawer
            categories={categories}
            brands={brands}
            activeCategory={categorySlug || null}
            activeBrand={brandSlug || null}
            inStockOnly={inStockOnly}
          />
        </div>

        {/* Layout: sidebar (desktop only) + grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Desktop filter sidebar — hidden on mobile, replaced by drawer */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 space-y-8 overflow-hidden">
            <div className="border-t border-border-strong pt-5">
              <div className="eyebrow text-stone-500 mb-2">Category</div>
              <div className="divide-y divide-border-subtle">
                <Link
                  href={`/products${brandSlug ? `?brand=${brandSlug}` : ''}`}
                  className={`block py-2 text-sm transition-colors truncate ${
                    !categorySlug
                      ? 'text-foreground font-medium'
                      : 'text-stone-500 hover:text-foreground'
                  }`}
                >
                  All categories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}${brandSlug ? `&brand=${brandSlug}` : ''}`}
                    className={`flex items-center justify-between py-2 text-sm transition-colors ${
                      categorySlug === cat.slug
                        ? 'text-foreground font-medium'
                        : 'text-stone-500 hover:text-foreground'
                    }`}
                  >
                    <span className="truncate mr-2">{cat.name}</span>
                    <span className="text-[11px] font-mono text-stone-400 shrink-0">{cat._count.products}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-border-strong pt-5">
              <div className="eyebrow text-stone-500 mb-2">Brand</div>
              <div className="divide-y divide-border-subtle">
                <Link
                  href={`/products${categorySlug ? `?category=${categorySlug}` : ''}`}
                  className={`block py-2 text-sm transition-colors ${
                    !brandSlug
                      ? 'text-foreground font-medium'
                      : 'text-stone-500 hover:text-foreground'
                  }`}
                >
                  All brands
                </Link>
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/products?brand=${b.slug}${categorySlug ? `&category=${categorySlug}` : ''}`}
                    className={`flex items-center justify-between py-2 text-sm transition-colors ${
                      brandSlug === b.slug
                        ? 'text-foreground font-medium'
                        : 'text-stone-500 hover:text-foreground'
                    }`}
                  >
                    <span className="truncate mr-2">{b.name}</span>
                    <span className="text-[11px] font-mono text-stone-400 shrink-0">{b._count.products}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-border-strong pt-5">
              <Link
                href={`/products?${new URLSearchParams({
                  ...(categorySlug && { category: categorySlug }),
                  ...(brandSlug && { brand: brandSlug }),
                  ...(searchQuery && { search: searchQuery }),
                  inStock: inStockOnly ? 'false' : 'true',
                }).toString()}`}
                className="flex items-center gap-2.5 text-sm text-stone-600 dark:text-stone-400 hover:text-foreground transition-colors"
              >
                <span className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                  inStockOnly
                    ? 'bg-foreground border-foreground text-background'
                    : 'border-stone-400 dark:border-stone-600'
                }`}>
                  {inStockOnly && <Check className="w-3 h-3" />}
                </span>
                <span>In-stock items only</span>
              </Link>
            </div>
          </aside>

          {/* Product grid */}
          <div className="lg:col-span-9 min-w-0">
            {products.length === 0 ? (
              <div className="border border-border bg-card p-12 sm:p-16 text-center max-w-md mx-auto my-8">
                <div className="flex items-center justify-center mb-6">
                  <span className="dot-rec" />
                </div>
                <h3 className="display text-2xl text-foreground">No matching products</h3>
                <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">
                  Try clearing filters or searching for "4MP", "Hikvision", or "DVR".
                </p>
                <Link href="/products" className="btn-ink mt-8">
                  View all products <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border-strong">
                {products.map((product) => (
                  <div key={product.id} className="bg-background">
                    <ProductCard product={product} />
                  </div>
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
