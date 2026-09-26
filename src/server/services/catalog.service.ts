import { prisma } from '@/server/db';
import { Prisma } from '@prisma/client';

export interface FilterProductsParams {
  categorySlug?: string;
  brandSlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'featured' | 'newest';
}

export async function getCategories() {
  return await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    include: {
      children: {
        where: { isActive: true },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getAllCategoriesFlat() {
  return await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getPopularBrands() {
  return await prisma.brand.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getFeaturedProducts() {
  return await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      brand: true,
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
      variants: {
        where: { isActive: true },
        include: {
          sku: {
            include: {
              inventory: true,
            },
          },
        },
      },
    },
    take: 8,
  });
}

export async function getFilteredProducts(params: FilterProductsParams) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  // Category filter
  if (params.categorySlug) {
    where.category = {
      slug: params.categorySlug,
    };
  }

  // Brand filter
  if (params.brandSlug) {
    where.brand = {
      slug: params.brandSlug,
    };
  }

  // Search filter (name, model, description)
  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { modelNumber: { contains: q, mode: 'insensitive' } },
      { shortDesc: { contains: q, mode: 'insensitive' } },
      { brand: { name: { contains: q, mode: 'insensitive' } } },
      { variants: { some: { sku: { code: { contains: q, mode: 'insensitive' } } } } },
    ];
  }

  // Price & Stock filters on variants
  const variantFilter: Prisma.ProductVariantWhereInput = {
    isActive: true,
  };

  const skuWhere: Prisma.SkuWhereInput = {};

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    skuWhere.sellingPrice = {
      gte: params.minPrice !== undefined ? params.minPrice : undefined,
      lte: params.maxPrice !== undefined ? params.maxPrice : undefined,
    };
  }

  if (params.inStockOnly) {
    skuWhere.inventory = {
      is: {
        currentStock: { gt: 0 },
      },
    };
  }

  if (Object.keys(skuWhere).length > 0) {
    variantFilter.sku = { is: skuWhere };
  }

  // Order By
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  if (params.sortBy === 'featured') {
    orderBy = { isFeatured: 'desc' };
  } else if (params.sortBy === 'newest') {
    orderBy = { createdAt: 'desc' };
  }

  return await prisma.product.findMany({
    where,
    include: {
      brand: true,
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      variants: {
        where: variantFilter,
        include: {
          sku: {
            include: {
              inventory: true,
            },
          },
        },
      },
    },
    orderBy,
  });
}

export async function getProductBySlug(slug: string) {
  return await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      variants: {
        where: { isActive: true },
        include: {
          sku: {
            include: {
              inventory: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Fast search helper for autocomplete dropdown in Header.
 */
export async function searchProductsQuick(query: string) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { modelNumber: { contains: q, mode: 'insensitive' } },
        { brand: { name: { contains: q, mode: 'insensitive' } } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
        { variants: { some: { sku: { code: { contains: q, mode: 'insensitive' } } } } },
      ],
    },
    include: {
      brand: true,
      category: true,
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
      variants: {
        where: { isActive: true },
        include: { sku: true },
        take: 1,
      },
    },
    take: 6,
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    modelNumber: p.modelNumber,
    brandName: p.brand.name,
    categoryName: p.category.name,
    imageUrl: p.images[0]?.url || null,
    sellingPrice: p.variants[0]?.sku?.sellingPrice ? Number(p.variants[0].sku.sellingPrice) : 0,
  }));
}

