'use server';

import { revalidatePath } from 'next/cache';
import {
  adjustSkuStock,
  toggleProductCodAllowed,
  toggleProductActive,
  updateOrderItemSerialNumbers,
} from '@/server/services/admin.service';
import { transitionOrderStatus } from '@/server/services/order.service';
import { createShipmentForOrder } from '@/server/services/shipping.service';
import { OrderStatus, MovementReason } from '@prisma/client';

export async function adjustStockAction(input: {
  skuId: string;
  delta: number;
  reason: string;
  notes?: string;
}) {
  try {
    const updated = await adjustSkuStock({
      skuId: input.skuId,
      quantityDelta: input.delta,
      reason: input.reason as MovementReason,
      notes: input.notes,
    });
    revalidatePath('/admin');
    revalidatePath('/admin/inventory');
    return { success: true, data: updated };
  } catch (err: unknown) {
    return { success: false, error: (err instanceof Error ? err.message : String(err)) || 'Failed to adjust stock' };
  }
}

export async function toggleProductCodAction(productId: string, isCodAllowed: boolean) {
  try {
    const updated = await toggleProductCodAllowed(productId, isCodAllowed);
    revalidatePath('/admin/products');
    revalidatePath('/admin/settings/cod');
    revalidatePath('/products');
    return { success: true, data: updated };
  } catch (err: unknown) {
    return { success: false, error: (err instanceof Error ? err.message : String(err)) || 'Failed to toggle COD policy' };
  }
}

export async function adminTransitionOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  comment?: string
) {
  try {
    const updated = await transitionOrderStatus(
      orderId,
      newStatus,
      comment || `Manual transition by Administrator to ${newStatus}`,
      'Administrator'
    );
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true, data: updated };
  } catch (err: unknown) {
    return { success: false, error: (err instanceof Error ? err.message : String(err)) || 'Status transition failed' };
  }
}

export async function adminCreateShipmentAction(orderId: string, carrier?: string) {
  try {
    const shipment = await createShipmentForOrder(orderId, {
      carrier,
      autoAdvanceStatus: true,
    });
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true, data: shipment };
  } catch (err: unknown) {
    return { success: false, error: (err instanceof Error ? err.message : String(err)) || 'Failed to book shipment' };
  }
}

export async function saveSerialNumbersAction(
  orderItemId: string,
  serialNumbers: string[]
) {
  try {
    const updated = await updateOrderItemSerialNumbers(orderItemId, serialNumbers);
    revalidatePath('/admin/orders');
    return { success: true, data: updated };
  } catch (err: unknown) {
    return { success: false, error: (err instanceof Error ? err.message : String(err)) || 'Failed to save serial numbers' };
  }
}
