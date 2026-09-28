import React from 'react';
import { StockAdjustPanel } from '@/components/stock/StockAdjustPanel';
import { prisma } from '@/server/db';

export const revalidate = 0;

export default async function StockAdjustPage() {
  const skus = await prisma.sku.findMany({
    where: { variant: { isNot: null } },
    include: {
      inventory: true,
      variant: {
        include: {
          product: {
            include: {
              brand: true,
            },
          },
        },
      },
    },
    orderBy: { code: 'asc' },
  });

  const serialized = skus
    .filter((s) => s.variant)
    .map((s) => ({
      id: s.id,
      code: s.code,
      variantName: s.variant!.name,
      productName: s.variant!.product.name,
      brandName: s.variant!.product.brand.name,
      sellingPrice: Number(s.sellingPrice),
      currentStock: s.inventory?.currentStock ?? 0,
      reservedStock: s.inventory?.reservedStock ?? 0,
      lowStockThreshold: s.inventory?.lowStockThreshold ?? 5,
    }));

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <StockAdjustPanel skus={serialized} />
    </div>
  );
}
