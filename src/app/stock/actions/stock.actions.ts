'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/db';
import { StockPermission } from '@prisma/client';
import {
  EmployeeAuthService,
  type EmployeeSessionPayload,
} from '@/server/services/employee-auth.service';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

/**
 * Mutation result — for write actions that don't redirect.
 */
type ActionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Login result — for the login action which always returns a redirect URL
 * on success.
 */
type LoginResult =
  | { success: true; redirectUrl: string }
  | { success: false; error: string };

interface CountEntry {
  skuId: string;
  countedQty: number;
}

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                  */
/* ------------------------------------------------------------------ */

async function requireSession(): Promise<EmployeeSessionPayload> {
  const session = await EmployeeAuthService.getEmployeeSession();
  if (!session) {
    throw new Error('Unauthorized — no active employee session.');
  }
  return session;
}

async function requirePermission(
  permission: StockPermission
): Promise<EmployeeSessionPayload> {
  const session = await requireSession();
  if (!EmployeeAuthService.hasPermission(session, permission)) {
    throw new Error(`Unauthorized — missing permission: ${permission}.`);
  }
  return session;
}

/* ------------------------------------------------------------------ */
/*  1. employeeLoginAction                                            */
/* ------------------------------------------------------------------ */
export async function employeeLoginAction(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const next = (formData.get('next') as string) || '/stock';

  if (!email || !password) {
    return { success: false, error: 'Please enter both email and password.' };
  }

  const res = await EmployeeAuthService.createEmployeeSession(email, password);
  if (!res.success) {
    return { success: false, error: res.error || 'Authentication failed.' };
  }

  // Re-read the freshly-set cookie so we can enforce STOCK_VIEW on entry.
  const session = await EmployeeAuthService.getEmployeeSession();
  if (!EmployeeAuthService.hasPermission(session, StockPermission.STOCK_VIEW)) {
    await EmployeeAuthService.clearEmployeeSession();
    return {
      success: false,
      error: 'Your account does not have STOCK_VIEW permission. Contact the operations manager.',
    };
  }

  return {
    success: true,
    redirectUrl: next.startsWith('/stock') ? next : '/stock',
  };
}

/* ------------------------------------------------------------------ */
/*  2. employeeLogoutAction                                           */
/* ------------------------------------------------------------------ */
export async function employeeLogoutAction(): Promise<void> {
  await EmployeeAuthService.clearEmployeeSession();
  redirect('/stock/login');
}

/* ------------------------------------------------------------------ */
/*  3. acknowledgeAlertAction                                         */
/* ------------------------------------------------------------------ */
export async function acknowledgeAlertAction(alertId: string): Promise<ActionResult> {
  let session: EmployeeSessionPayload;
  try {
    session = await requirePermission(StockPermission.STOCK_MANAGE_ALERTS);
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unauthorized' };
  }

  try {
    const existing = await prisma.stockAlert.findUnique({
      where: { id: alertId },
      select: { id: true, status: true },
    });
    if (!existing) return { success: false, error: 'Alert not found.' };

    await prisma.stockAlert.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedBy: session.userId,
        acknowledgedAt: new Date(),
      },
    });

    revalidatePath('/stock/alerts');
    revalidatePath('/stock');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to acknowledge alert.' };
  }
}

/* ------------------------------------------------------------------ */
/*  4. resolveAlertAction                                             */
/* ------------------------------------------------------------------ */
export async function resolveAlertAction(alertId: string): Promise<ActionResult> {
  let session: EmployeeSessionPayload;
  try {
    session = await requirePermission(StockPermission.STOCK_MANAGE_ALERTS);
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unauthorized' };
  }

  try {
    const existing = await prisma.stockAlert.findUnique({
      where: { id: alertId },
      select: { id: true, status: true },
    });
    if (!existing) return { success: false, error: 'Alert not found.' };

    await prisma.stockAlert.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        resolvedBy: session.userId,
        resolvedAt: new Date(),
      },
    });

    revalidatePath('/stock/alerts');
    revalidatePath('/stock');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to resolve alert.' };
  }
}

/* ------------------------------------------------------------------ */
/*  5. generateAlertsAction                                           */
/* ------------------------------------------------------------------ */
/**
 * Scans every Inventory row and creates OPEN alerts for any SKU at or below
 * its low stock threshold that doesn't already have an OPEN alert. Idempotent.
 */
export async function generateAlertsAction(): Promise<
  ActionResult & { created?: number; skipped?: number }
> {
  try {
    await requirePermission(StockPermission.STOCK_MANAGE_ALERTS);
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unauthorized' };
  }

  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        sku: { select: { id: true, code: true } },
      },
    });

    const existingOpen = await prisma.stockAlert.findMany({
      where: { status: 'OPEN' },
      select: { skuId: true },
    });
    const openSkuIds = new Set(existingOpen.map((a) => a.skuId));

    let created = 0;
    let skipped = 0;

    for (const inv of inventories) {
      if (inv.currentStock > inv.lowStockThreshold) {
        skipped++;
        continue;
      }
      if (openSkuIds.has(inv.skuId)) {
        skipped++;
        continue;
      }

      const alertType = inv.currentStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK';
      await prisma.stockAlert.create({
        data: {
          skuId: inv.skuId,
          alertType,
          threshold: inv.lowStockThreshold,
          currentStock: inv.currentStock,
          status: 'OPEN',
        },
      });
      created++;
    }

    revalidatePath('/stock/alerts');
    revalidatePath('/stock');
    return { success: true, created, skipped };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to generate alerts.' };
  }
}

/* ------------------------------------------------------------------ */
/*  6. createCountSessionAction                                       */
/* ------------------------------------------------------------------ */
export async function createCountSessionAction(
  name: string,
  assignedSkus: string[]
): Promise<ActionResult & { sessionId?: string }> {
  let session: EmployeeSessionPayload;
  try {
    session = await requirePermission(StockPermission.STOCK_RECONCILE);
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unauthorized' };
  }

  try {
    const trimmedName = String(name || '').trim();
    if (!trimmedName) {
      return { success: false, error: 'Count session name is required.' };
    }

    const skuIds = Array.from(new Set(assignedSkus)).filter(Boolean);
    if (skuIds.length === 0) {
      return { success: false, error: 'Assign at least one SKU to count.' };
    }

    const inventories = await prisma.inventory.findMany({
      where: { skuId: { in: skuIds } },
      select: { skuId: true, currentStock: true },
    });

    const created = await prisma.stockCountSession.create({
      data: {
        name: trimmedName,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        assignedTo: session.userId,
        createdBy: session.userId,
        reconciliations: {
          create: inventories.map((inv) => ({
            skuId: inv.skuId,
            expectedQty: inv.currentStock,
            countedQty: null,
            variance: null,
            status: 'PENDING',
          })),
        },
      },
    });

    revalidatePath('/stock');
    return { success: true, sessionId: created.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create count session.' };
  }
}

/* ------------------------------------------------------------------ */
/*  7. submitStockCountAction                                         */
/* ------------------------------------------------------------------ */
export async function submitStockCountAction(
  sessionId: string,
  counts: CountEntry[]
): Promise<ActionResult> {
  let session: EmployeeSessionPayload;
  try {
    session = await requirePermission(StockPermission.STOCK_RECONCILE);
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unauthorized' };
  }

  try {
    const existing = await prisma.stockCountSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true },
    });
    if (!existing) return { success: false, error: 'Count session not found.' };
    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      return { success: false, error: `Session is already ${existing.status}.` };
    }

    if (!Array.isArray(counts) || counts.length === 0) {
      return { success: false, error: 'No counts submitted.' };
    }

    await prisma.$transaction(async (tx) => {
      for (const c of counts) {
        const recon = await tx.stockReconciliation.findFirst({
          where: { sessionId, skuId: c.skuId },
          select: { id: true, expectedQty: true },
        });
        if (!recon) continue;

        const variance = c.countedQty - recon.expectedQty;
        const status = variance === 0 ? 'MATCHED' : 'DISCREPANCY';
        await tx.stockReconciliation.update({
          where: { id: recon.id },
          data: {
            countedQty: c.countedQty,
            variance,
            status,
            countedBy: session.userId,
          },
        });
      }

      await tx.stockCountSession.update({
        where: { id: sessionId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    });

    revalidatePath('/stock');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to submit stock count.' };
  }
}
