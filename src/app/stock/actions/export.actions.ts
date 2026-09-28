'use server';

import { prisma } from '@/server/db';
import { Prisma, MovementReason } from '@prisma/client';
import {
  EmployeeAuthService,
} from '@/server/services/employee-auth.service';
import type { MovementFilters } from '@/server/services/stock.service';

/**
 * exportMovementsCsvAction — returns a CSV string of all movements matching
 * the supplied filters (no pagination). Caller must have STOCK_EXPORT.
 *
 * CSV columns: id, skuCode, productName, variant, type (IN/OUT/ADJUST),
 * quantity, reason, referenceId, notes, user, timestamp (ISO 8601).
 */
export async function exportMovementsCsvAction(
  filters: MovementFilters
): Promise<{ success: true; csv: string; filename: string } | { success: false; error: string }> {
  let session;
  try {
    session = await EmployeeAuthService.getEmployeeSession();
    if (!session) {
      return { success: false, error: 'Unauthorized — no active session.' };
    }
    if (!EmployeeAuthService.hasPermission(session, 'STOCK_EXPORT')) {
      return { success: false, error: 'Unauthorized — missing STOCK_EXPORT permission.' };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unauthorized' };
  }

  try {
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

    const rows = await prisma.inventoryMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5000,
      include: {
        sku: {
          include: { variant: { include: { product: { select: { name: true } } } } },
        },
      },
    });

    const creatorIds = Array.from(
      new Set(rows.map((m) => m.createdById).filter(Boolean) as string[])
    );
    const creators = creatorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: creatorIds } },
          select: { id: true, email: true },
        })
      : [];
    const emailById = new Map(creators.map((u) => [u.id, u.email || 'system']));

    const headers = [
      'id',
      'skuCode',
      'productName',
      'variant',
      'type',
      'quantity',
      'reason',
      'referenceId',
      'notes',
      'user',
      'timestamp',
    ];

    const escape = (s: string | null | undefined) => {
      if (s == null) return '';
      const str = String(s);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines = [headers.join(',')];

    for (const m of rows) {
      const type = m.quantity >= 0 ? 'IN' : 'OUT';
      lines.push(
        [
          escape(m.id),
          escape(m.sku?.code || ''),
          escape(m.sku?.variant?.product?.name || ''),
          escape(m.sku?.variant?.name || ''),
          escape(type),
          String(m.quantity),
          escape(m.reason),
          escape(m.referenceId),
          escape(m.notes),
          escape((m.createdById && emailById.get(m.createdById)) || 'system'),
          escape(m.createdAt.toISOString()),
        ].join(',')
      );
    }

    const csv = lines.join('\n');
    const stamp = new Date().toISOString().slice(0, 10);
    return {
      success: true,
      csv,
      filename: `stock-movements-${stamp}.csv`,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'CSV export failed.' };
  }
}
