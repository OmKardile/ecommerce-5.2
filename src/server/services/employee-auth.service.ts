import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@/server/db';
import { UserRole } from '@prisma/client';
import { hasPermission as hasPermissionUtil } from '@/lib/permissions';

/**
 * Employee authentication service — Stock Monitor Panel + Staff Panel.
 *
 * Mirrors the AdminAuthService pattern but with an ISOLATED session cookie
 * (`pn_stock_session`), separate from the admin (`pn_admin_session`) and
 * customer (`pn_session`) cookies. This isolation follows ADR-019 so a
 * warehouse employee can be signed into the stock panel while a manager
 * is signed into the admin command center on the same device without the
 * sessions colliding.
 *
 * Session payload (JWT): { employeeId, userId, email, fullName, employeeCode,
 * role: 'STAFF', permissions: string[] }
 *
 * Permissions are plain string literals from @/lib/permissions (ALL_PERMISSIONS).
 */

export const EMPLOYEE_COOKIE_NAME = 'pn_stock_session';

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || 'patel_networks_secure_jwt_secret_key_32_bytes!';
const JWT_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

// Default credentials — matches the seed created in the Employee Management
// console (superadmin creates `stock@patelnetworks.in` / `stock@2026` with
// STOCK_VIEW + STOCK_ADJUST + STOCK_EXPORT). These defaults are also used
// as a fallback when no DB row exists (dev convenience).
const DEFAULT_EMPLOYEE_EMAIL =
  process.env.EMPLOYEE_EMAIL || 'stock@patelnetworks.in';
const DEFAULT_EMPLOYEE_PASSWORD =
  process.env.EMPLOYEE_PASSWORD || 'stock@2026';

// Default permissions granted to the fallback account when no DB row exists.
const DEFAULT_FALLBACK_PERMISSIONS: string[] = [
  'STOCK_VIEW',
  'INVENTORY_ADJUST',
  'STOCK_EXPORT',
];

export interface EmployeeSessionPayload {
  employeeId: string;
  userId: string;
  email: string;
  fullName: string;
  employeeCode: string | null;
  role: 'STAFF';
  permissions: string[];
  iat?: number;
  exp?: number;
}

export class EmployeeAuthService {
  /**
   * Authenticates a stock-panel employee via email + password and sets an
   * isolated HTTP-only session cookie (`pn_stock_session`).
   *
   * Resolution order:
   *   1. Look up a User with `email` that has an active EmployeeProfile.
   *   2. If not found, fall back to the configured default credentials.
   *
   * Returns a structured result; never throws on auth failure.
   */
  static async createEmployeeSession(
    emailInput: string,
    passwordInput: string
  ): Promise<{
    success: boolean;
    error?: string;
    employee?: {
      email: string;
      fullName: string;
      employeeCode: string | null;
      permissions: string[];
    };
  }> {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    let payload: EmployeeSessionPayload | null = null;

    // 1. Database lookup — real staff account created via /admin/employees
    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          email,
          isActive: true,
          role: UserRole.STAFF,
          employeeProfile: { isActive: true },
        },
        include: { employeeProfile: true },
      });

      if (dbUser && dbUser.passwordHash && dbUser.employeeProfile) {
        if (dbUser.passwordHash === password) {
          payload = {
            employeeId: dbUser.employeeProfile.id,
            userId: dbUser.id,
            email: dbUser.email || email,
            fullName: dbUser.employeeProfile.fullName,
            employeeCode: dbUser.employeeProfile.employeeCode,
            role: 'STAFF',
            permissions: dbUser.employeeProfile.permissions,
          };
        }
      }
    } catch {
      // DB error → fall through to default-credentials path
    }

    // 2. Default configured credentials (dev/staging fallback)
    if (!payload) {
      if (
        email === DEFAULT_EMPLOYEE_EMAIL.toLowerCase() &&
        password === DEFAULT_EMPLOYEE_PASSWORD
      ) {
        payload = {
          employeeId: 'employee-default-stock',
          userId: 'employee-default-stock',
          email: DEFAULT_EMPLOYEE_EMAIL,
          fullName: 'Warehouse Stock Operator',
          employeeCode: 'EMP-001',
          role: 'STAFF',
          permissions: DEFAULT_FALLBACK_PERMISSIONS,
        };
      }
    }

    if (!payload) {
      return {
        success: false,
        error: 'Invalid staff credentials. Contact the operations manager if you have forgotten your access key.',
      };
    }

    // 3. Issue a 7-day JWT
    const token = await new SignJWT({
      employeeId: payload.employeeId,
      userId: payload.userId,
      email: payload.email,
      fullName: payload.fullName,
      employeeCode: payload.employeeCode,
      role: payload.role,
      permissions: payload.permissions,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_KEY);

    // 4. Set secure HTTP-only cookie (isolated from admin + customer)
    try {
      const cookieStore = await cookies();
      cookieStore.set(EMPLOYEE_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    } catch {
      // Non-request context (test) — graceful no-op
    }

    return {
      success: true,
      employee: {
        email: payload.email,
        fullName: payload.fullName,
        employeeCode: payload.employeeCode,
        permissions: payload.permissions,
      },
    };
  }

  /**
   * Reads + verifies the `pn_stock_session` cookie.
   * Returns null if missing or invalid (caller should redirect to /stock/login).
   */
  static async getEmployeeSession(): Promise<EmployeeSessionPayload | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(EMPLOYEE_COOKIE_NAME)?.value;
      if (!token) return null;

      const { payload } = await jwtVerify(token, JWT_KEY);
      return payload as unknown as EmployeeSessionPayload;
    } catch {
      return null;
    }
  }

  /**
   * Clears the `pn_stock_session` cookie — signs the employee out.
   */
  static async clearEmployeeSession(): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.set(EMPLOYEE_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
    } catch {
      // Graceful fallback in non-request contexts
    }
  }

  /**
   * Returns true if the session has the requested permission.
   * Uses the shared @/lib/permissions hasPermission() so role + permissions
   * are interpreted consistently across the proxy, layouts, server actions,
   * and the admin sidebar.
   *
   * For stock-panel sessions the role is always 'STAFF', so this reduces to a
   * plain `permissions.includes(permission)` check.
   */
  static hasPermission(
    session: EmployeeSessionPayload | null,
    permission: string
  ): boolean {
    if (!session) return false;
    return hasPermissionUtil(
      session.role ?? 'STAFF',
      session.permissions,
      permission
    );
  }
}

// Convenience re-export so callers can do:
//   import { hasPermission } from '@/server/services/employee-auth.service';
export const hasPermission = EmployeeAuthService.hasPermission;
