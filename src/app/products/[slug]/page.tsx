import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { DynamicVariantSelector } from '@/components/storefront/DynamicVariantSelector';
import { Badge } from '@/components/ui/Badge';
import { getProductBySlug } from '@/server/services/catalog.service';
import { B2BContractorCallout } from '@/components/storefront/B2BContractorCallout';
import { Shield, FileCheck, Layers, PhoneCall, HelpCircle } from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found | Patel Networks' };
  }

  return {
    title: `${product.name} | Patel Networks Surveillance`,
    description: product.shortDesc || `Buy ${product.name} with 18% GST input tax credit and express shipping.`,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const mainImage =
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80';

  const specs = (product.specifications as Record<string, string>) || {};

  const serializedProduct = {
    ...product,
    variants: product.variants.map((v) => ({
      ...v,
      sku: {
        ...v.sku,
        mrp: Number(v.sku.mrp),
        sellingPrice: Number(v.sku.sellingPrice),
      },
    })),
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.name,
        description: product.shortDesc || product.description,
        image: mainImage,
        brand: {
          '@type': 'Brand',
          name: product.brand.name,
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'INR',
          lowPrice: Math.min(...product.variants.map((v) => Number(v.sku.sellingPrice))),
          highPrice: Math.max(...product.variants.map((v) => Number(v.sku.sellingPrice))),
          offerCount: product.variants.length,
          availability: 'https://schema.org/InStock',
        },
        category: product.category.name,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://patelnetworks.in',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Catalog',
            item: 'https://patelnetworks.in/products',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.category.name,
            item: `https://patelnetworks.in/products?category=${product.category.slug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: product.name,
          },
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-slate-500 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-slate-900 dark:hover:text-white">
            Catalog
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category.slug}`}
            className="hover:text-slate-900 dark:hover:text-white"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Product Layout: Gallery + Variant Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 pb-14 border-b border-slate-200 dark:border-slate-800">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-4/3 w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 shadow-xs flex items-center justify-center overflow-hidden">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-6"
              />
            </div>

            {/* Thumbnail preview if multiple images */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3">
                {product.images.map((img, i) => (
                  <div
                    key={img.id}
                    className={`relative w-20 h-20 rounded-xl bg-white dark:bg-slate-900 border p-2 cursor-pointer ${
                      i === 0 ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Image src={img.url} alt="Thumbnail" fill className="object-contain p-1" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Dynamic Variant Selector */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="tech" className="uppercase font-bold tracking-wider">
                  {product.brand.name}
                </Badge>
                {product.modelNumber && (
                  <span className="text-xs font-mono text-slate-400">
                    Model: {product.modelNumber}
                  </span>
                )}
                {product.category.hsnCode && (
                  <span className="text-xs text-slate-400 font-mono">
                    HSN: {product.category.hsnCode}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {product.name}
              </h1>

              {product.shortDesc && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  {product.shortDesc}
                </p>
              )}
            </div>

            {/* Dynamic Variant Selector Client Component */}
            <DynamicVariantSelector product={serializedProduct} />

            {/* B2B Bulk / Trade Inquiries Callout */}
            <B2BContractorCallout
              productName={product.name}
              skuCode={product.modelNumber || undefined}
            />
          </div>
        </div>

        {/* Technical Specifications & Description */}
        <div className="py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Detailed Description */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500" /> Technical Product Overview
            </h2>
            <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              {product.description}
            </div>
          </div>

          {/* Right: Key Specifications Table */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" /> Engineering Specifications
            </h2>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-xs">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-3 flex justify-between bg-slate-50/50 dark:bg-slate-800/40 font-medium">
                  <span className="text-slate-500">Brand</span>
                  <span className="font-bold text-slate-900 dark:text-white">{product.brand.name}</span>
                </div>
                {product.modelNumber && (
                  <div className="p-3 flex justify-between">
                    <span className="text-slate-500">Model Number</span>
                    <span className="font-mono text-slate-900 dark:text-white">{product.modelNumber}</span>
                  </div>
                )}
                {Object.entries(specs).map(([key, val]) => (
                  <div key={key} className="p-3 flex justify-between">
                    <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[55%]">
                      {val}
                    </span>
                  </div>
                ))}
                <div className="p-3 flex justify-between bg-emerald-50/40 dark:bg-emerald-950/20">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">GST Rate</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">18% (HSN {product.category.hsnCode || '8525'})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
