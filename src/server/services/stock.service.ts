import { prisma } from '@/server/db';
import { Prisma, MovementReason } from '@prisma/client';
import type { EmployeeSessionPayload } from '@/server/services/employee-auth.service';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface StockDashboardData {
  totalSkus: number;
  totalStockValue: number; // sum of currentStock * sellingPrice across all SKUs
  lowStockCount: number;
  outOfStockCount: number;
  recentAlerts: Array<{
    id: string;
    skuCode: string;
    productName: string;
    alertType: string;
    currentStock: number;
    threshold: number;
    status: string;
    createdAt: string;
  }>;
  recentMovements: Array<{
    id: string;
    skuCode: string;
    productName: string;
    quantity: number;
    reason: string;
    notes: string | null;
    userName: string;
    createdAt: string;
  }>;
  canReconcile: boolean;
  canExport: boolean;
  canManageAlerts: boolean;
}

export interface StockAlertRow {
  id: string;
  skuId: string;
  skuCode: string;
  productName: string;
  variantName: string;
  alertType: string;
  threshold: number;
  currentStock: number;
  status: string;
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface StockMovementRow {
  id: string;
  skuId: string;
  skuCode: string;
  productName: string;
  variantName: string;
  quantity: number;
  reason: string;
  referenceId: string | null;
  notes: string | null;
  createdById: string | null;
  createdByEmail: string | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                         */
/* ------------------------------------------------------------------ */

export async function getStockDashboardData(
  session: EmployeeSessionPayload | null
): Promise<StockDashboardData> {
  // Aggregate inventory + SKU + variant + product in one query.
  const inventories = await prisma.inventory.findMany({
    include: {
      sku: {
        include: {
          variant: {
            include: { product: { select: { name: true } } },
          },
        },
      },
    },
  });

  let totalStockValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const inv of inventories) {
    const selling = Number(inv.sku?.sellingPrice || 0);
    totalStockValue += inv.currentStock * selling;
    if (inv.currentStock === 0) {
      outOfStockCount++;
      lowStockCount++; // out-of-stock is a strict subset of low-stock
    } else if (inv.currentStock <= inv.lowStockThreshold) {
      lowStockCount++;
    }
  }

  // Recent alerts (last 5)
  const recentAlertsDb = await prisma.stockAlert.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      sku: {
        include: { variant: { include: { product: { select: { name: true } } } } },
      },
    },
  });

  const recentAlerts: StockDashboardData['recentAlerts'] = recentAlertsDb.map((a) => ({
    id: a.id,
    skuCode: a.sku?.code || '—',
    productName: a.sku?.variant?.product?.name || 'Surveillance Hardware',
    alertType: a.alertType,
    currentStock: a.currentStock,
    threshold: a.threshold,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  }));

  // Recent movements (last 10)
  const recentMovementsDb = await prisma.inventoryMovement.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      sku: {
        include: { variant: { include: { product: { select: { name: true } } } } },
      },
    },
  });

  // Resolve createdById → email in a single follow-up query (no relation on
  // InventoryMovement.createdById per the schema).
  const creatorIds = Array.from(
    new Set(recentMovementsDb.map((m) => m.createdById).filter(Boolean) as string[])
  );
  const creators = creatorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: creatorIds } },
        select: { id: true, email: true },
      })
    : [];
  const creatorEmailById = new Map(creators.map((u) => [u.id, u.email || 'system']));

  const recentMovements: StockDashboardData['recentMovements'] = recentMovementsDb.map((m) => ({
    id: m.id,
    skuCode: m.sku?.code || '—',
    productName: m.sku?.variant?.product?.name || 'Surveillance Hardware',
    quantity: m.quantity,
    reason: m.reason,
    notes: m.notes,
    userName: (m.createdById && creatorEmailById.get(m.createdById)) || 'system',
    createdAt: m.createdAt.toISOString(),
  }));

  return {
    totalSkus: inventories.length,
    totalStockValue,
    lowStockCount,
    outOfStockCount,
    recentAlerts,
    recentMovements,
    canReconcile: session?.permissions?.includes('STOCK_COUNT') ?? false,
    canExport: session?.permissions?.includes('STOCK_EXPORT') ?? false,
    canManageAlerts: session?.permissions?.includes('STOCK_ALERTS_MANAGE') ?? false,
  };
}

/* ------------------------------------------------------------------ */
/*  Alerts                                                            */
/* ------------------------------------------------------------------ */

export async function getStockAlerts(status?: string): Promise<StockAlertRow[]> {
  const where = status && status !== 'ALL' ? { status } : {};
  const alerts = await prisma.stockAlert.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      sku: {
        include: { variant: { include: { product: { select: { name: true } } } } },
      },
    },
  });

  return alerts.map((a) => ({
    id: a.id,
    skuId: a.skuId,
    skuCode: a.sku?.code || '—',
    productName: a.sku?.variant?.product?.name || 'Surveillance Hardware',
    variantName: a.sku?.variant?.name || 'Default',
    alertType: a.alertType,
    threshold: a.threshold,
    currentStock: a.currentStock,
    status: a.status,
    acknowledgedBy: a.acknowledgedBy,
    acknowledgedAt: a.acknowledgedAt?.toISOString() || null,
    resolvedBy: a.resolvedBy,
    resolvedAt: a.resolvedAt?.toISOString() || null,
    createdAt: a.createdAt.toISOString(),
  }));
}

/* ------------------------------------------------------------------ */
/*  Movements                                                         */
/* ------------------------------------------------------------------ */

export interface MovementFilters {
  search?: string;
  reason?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export async function getStockMovements(
  filters: MovementFilters = {}
): Promise<{ rows: StockMovementRow[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, filters.pageSize || 25);

  const where: Prisma.InventoryMovementWhereInput = {};

  if (filters.reason && filters.reason !== 'ALL') {
    where.reason = filters.reason as MovementReason;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { sku: { code: { contains: q, mode: 'insensitive' } } },
      { sku: { barcode: { contains: q } } },
      { sku: { variant: { product: { name: { contains: q, mode: 'insensitive' } } } } },
      { notes: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.inventoryMovement.count({ where }),
    prisma.inventoryMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        sku: {
          include: { variant: { include: { product: { select: { name: true } } } } },
        },
      },
    }),
  ]);

  // Resolve creator emails in a single follow-up query.
  const creatorIds = Array.from(
    new Set(rows.map((m) => m.createdById).filter(Boolean) as string[])
  );
  const creators = creatorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: creatorIds } },
        select: { id: true, email: true },
      })
    : [];
  const creatorEmailById = new Map(creators.map((u) => [u.id, u.email || null]));

  return {
    total,
    page,
    pageSize,
    rows: rows.map((m) => ({
      id: m.id,
      skuId: m.skuId,
      skuCode: m.sku?.code || '—',
      productName: m.sku?.variant?.product?.name || 'Surveillance Hardware',
      variantName: m.sku?.variant?.name || 'Default',
      quantity: m.quantity,
      reason: m.reason,
      referenceId: m.referenceId,
      notes: m.notes,
      createdById: m.createdById,
      createdByEmail: (m.createdById && creatorEmailById.get(m.createdById)) || null,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}
