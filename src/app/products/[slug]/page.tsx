import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { DynamicVariantSelector } from '@/components/storefront/DynamicVariantSelector';
import { getProductBySlug } from '@/server/services/catalog.service';
import { B2BContractorCallout } from '@/components/storefront/B2BContractorCallout';
import { Reveal } from '@/components/storefront/Reveal';
import { ArrowUpRight } from 'lucide-react';

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
        brand: { '@type': 'Brand', name: product.brand.name },
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
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://patelnetworks.in' },
          { '@type': 'ListItem', position: 2, name: 'Catalog', item: 'https://patelnetworks.in/products' },
          { '@type': 'ListItem', position: 3, name: product.category.name, item: `https://patelnetworks.in/products?category=${product.category.slug}` },
          { '@type': 'ListItem', position: 4, name: product.name },
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 py-8 sm:py-10 pb-24 md:pb-12">
        {/* Breadcrumb — hairline, editorial */}
        <nav className="text-[11px] text-stone-500 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="text-stone-300 dark:text-stone-600">/</span>
          <Link href="/products" className="hover:text-foreground transition-colors">Catalog</Link>
          <span className="text-stone-300 dark:text-stone-600">/</span>
          <Link
            href={`/products?category=${product.category.slug}`}
            className="hover:text-foreground transition-colors"
          >
            {product.category.name}
          </Link>
          <span className="text-stone-300 dark:text-stone-600">/</span>
          <span className="text-foreground truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Gallery + Info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 pb-16 border-b border-border">
          {/* Gallery — sharp, contained */}
          <div className="space-y-3">
            <Reveal>
              <div className="media-frame relative aspect-[4/3] w-full border border-border">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-10"
                />
                {/* Brand corner mark */}
                <div className="absolute top-0 left-0 bg-background/90 border-b border-r border-border px-2.5 py-1">
                  <span className="eyebrow text-stone-500">{product.brand.name}</span>
                </div>
              </div>
            </Reveal>

            {/* Thumbnails — sharp */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.slice(0, 5).map((img, i) => (
                  <div
                    key={img.id}
                    className={`relative aspect-square bg-card border overflow-hidden ${
                      i === 0 ? 'border-foreground' : 'border-border'
                    }`}
                  >
                    <Image src={img.url} alt="Thumbnail" fill className="object-contain p-2" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info column */}
          <div className="space-y-8">
            <Reveal delay={60}>
              <div>
                {/* Meta line */}
                <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                  {product.modelNumber && (
                    <span className="font-mono text-[11px] text-stone-500">
                      Model {product.modelNumber}
                    </span>
                  )}
                  {product.category.hsnCode && (
                    <>
                      <span className="text-stone-300 dark:text-stone-600">/</span>
                      <span className="font-mono text-[11px] text-stone-500">
                        HSN {product.category.hsnCode}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="display text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[1.05] text-foreground">
                  {product.name}
                </h1>

                {product.shortDesc && (
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-4 leading-relaxed max-w-prose">
                    {product.shortDesc}
                  </p>
                )}
              </div>
            </Reveal>

            <Reveal delay={100}>
              <DynamicVariantSelector product={serializedProduct} />
            </Reveal>

            <Reveal delay={140}>
              <B2BContractorCallout
                productName={product.name}
                skuCode={product.modelNumber || undefined}
              />
            </Reveal>
          </div>
        </div>

        {/* Specifications + Description — editorial */}
        <div className="py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Description */}
          <div className="lg:col-span-7 space-y-6">
            <Reveal>
              <div className="eyebrow text-stone-500 mb-4">Overview</div>
              <div className="text-sm text-stone-700 dark:text-stone-300 leading-[1.75] whitespace-pre-line max-w-prose">
                {product.description}
              </div>
            </Reveal>
          </div>

          {/* Specs table — hairline rows */}
          <div className="lg:col-span-5">
            <Reveal delay={60}>
              <div className="eyebrow text-stone-500 mb-4">Engineering specifications</div>
              <div className="border-t border-border">
                <SpecRow label="Brand" value={product.brand.name} />
                {product.modelNumber && (
                  <SpecRow label="Model" value={product.modelNumber} mono />
                )}
                {Object.entries(specs).map(([key, val]) => (
                  <SpecRow
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                    value={val}
                  />
                ))}
                <div className="border-t border-border py-3 flex justify-between items-baseline bg-accent/30">
                  <span className="eyebrow text-[var(--brand)]">GST rate</span>
                  <span className="text-sm font-mono text-[var(--brand)]">
                    18% · HSN {product.category.hsnCode || '8525'}
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-1.5 text-sm text-foreground link-underline"
              >
                Need a spec clarification? <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SpecRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border-t border-border py-3 flex justify-between items-baseline gap-4">
      <span className="eyebrow text-stone-500 shrink-0">{label}</span>
      <span
        className={`text-sm text-foreground text-right ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
