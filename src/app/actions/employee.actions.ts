'use server';

import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';
import { prisma } from '@/server/db';
import { AdminAuthService } from '@/server/services/admin-auth.service';
import { ALL_PERMISSIONS, DEFAULT_PERMISSIONS } from '@/lib/permissions';

/**
 * Employee / staff management server actions.
 *
 * Every action verifies the caller is a SUPER_ADMIN via the admin session
 * cookie (AdminAuthService.getAdminSession). Unauthorised callers receive
 * a structured error rather than throwing — so the client UI can display it.
 *
 * Permissions are stored as String[] (the EmployeeProfile.permissions column).
 * Validation uses ALL_PERMISSIONS from @/lib/permissions so the set is the
 * single source of truth across the wizard, sidebar, and stock panel.
 */

const ALL_PERMISSIONS_SET: ReadonlySet<string> = new Set(ALL_PERMISSIONS);

export interface EmployeeSummary {
  id: string; // EmployeeProfile.id
  userId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  loginPhone: string;
  employeeCode: string | null;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmployeeRow {
  id: string;
  userId: string;
  fullName: string;
  employeeCode: string | null;
  phone: string | null;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; email: string | null; phone: string; isActive: boolean };
}

function serialize(row: EmployeeRow): EmployeeSummary {
  return {
    id: row.id,
    userId: row.userId,
    fullName: row.fullName,
    email: row.user.email,
    phone: row.phone,
    loginPhone: row.user.phone,
    employeeCode: row.employeeCode,
    permissions: row.permissions,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function requireSuperAdmin() {
  const session = await AdminAuthService.getAdminSession();
  if (!session || session.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Unauthorized — SUPER_ADMIN access required.');
  }
  return session;
}

/**
 * Parse + validate a raw permissions array (from FormData or a direct call).
 * Falls back to DEFAULT_PERMISSIONS (['DASHBOARD_VIEW']) when empty/invalid.
 */
function parsePermissions(raw: unknown): string[] {
  if (!Array.isArray(raw) || raw.length === 0) return [...DEFAULT_PERMISSIONS];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of raw) {
    if (typeof value !== 'string') continue;
    if (!ALL_PERMISSIONS_SET.has(value)) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out.length > 0 ? out : [...DEFAULT_PERMISSIONS];
}

function toResult<T>(data: T) {
  return { success: true as const, data };
}

function toError(message: string) {
  return { success: false as const, error: message };
}

/* ------------------------------------------------------------------ */
/*  createEmployeeAction                                              */
/* ------------------------------------------------------------------ */
export async function createEmployeeAction(formData: FormData) {
  let session;
  try {
    session = await requireSuperAdmin();
  } catch (err: any) {
    return toError(err?.message || 'Unauthorized');
  }

  try {
    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const phone = String(formData.get('phone') || '').trim();
    const password = String(formData.get('password') || '');
    const employeeCodeRaw = String(formData.get('employeeCode') || '').trim();
    const employeeCode = employeeCodeRaw || null;
    const permissions = parsePermissions(formData.getAll('permissions'));

    if (!fullName || !email || !phone || !password) {
      return toError('Full name, email, phone, and password are required.');
    }
    if (password.length < 6) {
      return toError('Password must be at least 6 characters.');
    }

    const emailTaken = await prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });
    if (emailTaken) return toError('Email is already registered.');

    const phoneTaken = await prisma.user.findFirst({
      where: { phone },
      select: { id: true },
    });
    if (phoneTaken) return toError('Phone is already registered.');

    if (employeeCode) {
      const codeTaken = await prisma.employeeProfile.findUnique({
        where: { employeeCode },
        select: { id: true },
      });
      if (codeTaken) return toError('Employee code is already in use.');
    }

    const user = await prisma.user.create({
      data: {
        phone,
        email,
        passwordHash: password,
        role: UserRole.STAFF,
        isActive: true,
      },
    });

    const profile = await prisma.employeeProfile.create({
      data: {
        userId: user.id,
        fullName,
        employeeCode,
        phone,
        permissions,
        isActive: true,
        createdBy: session.adminId,
      },
      include: { user: true },
    });

    revalidatePath('/admin/employees');
    return toResult(serialize(profile as EmployeeRow));
  } catch (err: any) {
    return toError(err?.message || 'Failed to create staff member.');
  }
}

/* ------------------------------------------------------------------ */
/*  updateEmployeeAction                                             */
/* ------------------------------------------------------------------ */
export async function updateEmployeeAction(employeeId: string, formData: FormData) {
  try {
    await requireSuperAdmin();
  } catch (err: any) {
    return toError(err?.message || 'Unauthorized');
  }

  try {
    const existing = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: { user: true },
    });
    if (!existing) return toError('Staff member not found.');

    const fullName = String(formData.get('fullName') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const employeeCodeRaw = String(formData.get('employeeCode') || '').trim();
    const employeeCode = employeeCodeRaw || null;
    const permissions = parsePermissions(formData.getAll('permissions'));
    const isActiveRaw = String(formData.get('isActive') || '').trim();
    const isActive = isActiveRaw === 'true' || isActiveRaw === 'on';

    if (!fullName) return toError('Full name is required.');

    if (employeeCode && employeeCode !== existing.employeeCode) {
      const codeTaken = await prisma.employeeProfile.findUnique({
        where: { employeeCode },
        select: { id: true },
      });
      if (codeTaken && codeTaken.id !== employeeId) {
        return toError('Employee code is already in use.');
      }
    }

    // Phone also lives on the User (login identifier). Keep in sync when provided.
    if (phone && phone !== existing.user.phone) {
      const phoneTaken = await prisma.user.findFirst({
        where: { phone, NOT: { id: existing.userId } },
        select: { id: true },
      });
      if (phoneTaken) return toError('Phone is already registered to another account.');
    }

    const updated = await prisma.employeeProfile.update({
      where: { id: employeeId },
      data: {
        fullName,
        employeeCode,
        phone: phone || existing.phone,
        permissions,
        isActive,
      },
      include: { user: true },
    });

    // Keep User.isActive in sync so deactivated staff can't log in.
    if (updated.user.isActive !== updated.isActive) {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { isActive: updated.isActive },
      });
    }

    if (phone && phone !== existing.user.phone) {
      await prisma.user.update({
        where: { id: updated.userId },
        data: { phone },
      });
    }

    revalidatePath('/admin/employees');
    return toResult(serialize(updated as EmployeeRow));
  } catch (err: any) {
    return toError(err?.message || 'Failed to update staff member.');
  }
}

/* ------------------------------------------------------------------ */
/*  toggleEmployeeActiveAction                                       */
/* ------------------------------------------------------------------ */
export async function toggleEmployeeActiveAction(employeeId: string) {
  try {
    await requireSuperAdmin();
  } catch (err: any) {
    return toError(err?.message || 'Unauthorized');
  }

  try {
    const existing = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      include: { user: true },
    });
    if (!existing) return toError('Staff member not found.');

    const nextActive = !existing.isActive;

    const updated = await prisma.employeeProfile.update({
      where: { id: employeeId },
      data: { isActive: nextActive },
      include: { user: true },
    });

    if (existing.user.isActive !== nextActive) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { isActive: nextActive },
      });
    }

    revalidatePath('/admin/employees');
    return toResult(serialize(updated as EmployeeRow));
  } catch (err: any) {
    return toError(err?.message || 'Failed to toggle staff status.');
  }
}

/* ------------------------------------------------------------------ */
/*  updateEmployeePermissionsAction                                  */
/* ------------------------------------------------------------------ */
export async function updateEmployeePermissionsAction(
  employeeId: string,
  permissions: string[]
) {
  try {
    await requireSuperAdmin();
  } catch (err: any) {
    return toError(err?.message || 'Unauthorized');
  }

  try {
    const existing = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      select: { id: true },
    });
    if (!existing) return toError('Staff member not found.');

    const next = parsePermissions(permissions);

    const updated = await prisma.employeeProfile.update({
      where: { id: employeeId },
      data: { permissions: next },
      include: { user: true },
    });

    revalidatePath('/admin/employees');
    return toResult(serialize(updated as EmployeeRow));
  } catch (err: any) {
    return toError(err?.message || 'Failed to update permissions.');
  }
}

/* ------------------------------------------------------------------ */
/*  resetEmployeePasswordAction                                      */
/* ------------------------------------------------------------------ */
export async function resetEmployeePasswordAction(
  employeeId: string,
  newPassword: string
) {
  try {
    await requireSuperAdmin();
  } catch (err: any) {
    return toError(err?.message || 'Unauthorized');
  }

  try {
    if (!newPassword || newPassword.length < 6) {
      return toError('Password must be at least 6 characters.');
    }

    const existing = await prisma.employeeProfile.findUnique({
      where: { id: employeeId },
      select: { userId: true },
    });
    if (!existing) return toError('Staff member not found.');

    await prisma.user.update({
      where: { id: existing.userId },
      data: { passwordHash: newPassword },
    });

    revalidatePath('/admin/employees');
    return { success: true as const, data: { employeeId, reset: true } };
  } catch (err: any) {
    return toError(err?.message || 'Failed to reset password.');
  }
}
