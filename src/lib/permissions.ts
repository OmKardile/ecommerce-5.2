/**
 * Permission system for Patel Networks staff accounts.
 * 
 * SUPER_ADMIN: full access to everything (no permission checks needed)
 * STAFF: access is dynamically controlled by superadmin via these permissions
 * CUSTOMER: no admin access at all
 * 
 * Permissions are stored as String[] in the employee_profiles table.
 */

// All possible permissions a staff member can have.
// Grouped by module for the creation wizard UI.
export const PERMISSION_GROUPS = [
  {
    module: 'Dashboard',
    description: 'Overview metrics and KPIs',
    permissions: [
      { value: 'DASHBOARD_VIEW', label: 'View dashboard', description: 'See the admin overview with KPIs and recent activity' },
    ],
  },
  {
    module: 'Orders',
    description: 'Order fulfillment and management',
    permissions: [
      { value: 'ORDERS_VIEW', label: 'View orders', description: 'See the order list and order details' },
      { value: 'ORDERS_MANAGE', label: 'Manage orders', description: 'Fulfill, cancel, and transition order status' },
    ],
  },
  {
    module: 'Products',
    description: 'Product catalog management',
    permissions: [
      { value: 'PRODUCTS_VIEW', label: 'View products', description: 'See the product catalog table' },
      { value: 'PRODUCTS_MANAGE', label: 'Manage products', description: 'Toggle COD, visibility, and edit product details' },
    ],
  },
  {
    module: 'Inventory',
    description: 'Stock levels and adjustments',
    permissions: [
      { value: 'INVENTORY_VIEW', label: 'View inventory', description: 'See SKU stock levels and low-stock alerts' },
      { value: 'INVENTORY_ADJUST', label: 'Adjust stock', description: 'Log stock movements (in/out/adjust)' },
    ],
  },
  {
    module: 'Customers',
    description: 'Customer directory and B2B accounts',
    permissions: [
      { value: 'CUSTOMERS_VIEW', label: 'View customers', description: 'See the customer directory with B2B GSTIN data' },
      { value: 'CUSTOMERS_MANAGE', label: 'Manage customers', description: 'Edit customer profiles and B2B details' },
    ],
  },
  {
    module: 'Reports',
    description: 'Commercial reporting and GSTR-1',
    permissions: [
      { value: 'REPORTS_VIEW', label: 'View reports', description: 'See commercial reports and GSTR-1 tax analytics' },
      { value: 'REPORTS_EXPORT', label: 'Export reports', description: 'Download CSV exports of orders and GSTR-1 data' },
    ],
  },
  {
    module: 'Stock Panel',
    description: 'Dedicated stock monitor panel (/stock/*)',
    permissions: [
      { value: 'STOCK_VIEW', label: 'View stock panel', description: 'Access the /stock dashboard' },
      { value: 'STOCK_ALERTS_MANAGE', label: 'Manage alerts', description: 'Acknowledge and resolve stock alerts' },
      { value: 'STOCK_COUNT', label: 'Stock counts', description: 'Create and submit physical count sessions' },
      { value: 'STOCK_EXPORT', label: 'Export stock data', description: 'Download CSV of stock movements' },
    ],
  },
  {
    module: 'Employees',
    description: 'Staff account management',
    permissions: [
      { value: 'EMPLOYEES_VIEW', label: 'View staff', description: 'See the employee roster' },
      { value: 'EMPLOYEES_MANAGE', label: 'Manage staff', description: 'Create, edit, deactivate staff accounts' },
    ],
  },
  {
    module: 'Settings',
    description: 'Store configuration',
    permissions: [
      { value: 'SETTINGS_VIEW', label: 'View settings', description: 'See store configuration pages' },
      { value: 'SETTINGS_MANAGE', label: 'Manage settings', description: 'Edit COD rules and store settings' },
    ],
  },
] as const;

// Flat list of all permission values
export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap(
  (g) => g.permissions.map((p) => p.value)
);

// Default permissions for a new staff member (minimal access)
export const DEFAULT_PERMISSIONS = ['DASHBOARD_VIEW'];

// Check if a user has a specific permission
export function hasPermission(
  userRole: string,
  userPermissions: string[] | null | undefined,
  permission: string
): boolean {
  // SUPER_ADMIN has all permissions
  if (userRole === 'SUPER_ADMIN') return true;
  // Staff: check the permissions array
  if (userRole === 'STAFF') {
    return userPermissions?.includes(permission) ?? false;
  }
  // Customers have no admin permissions
  return false;
}

// Check if a user has ANY of the given permissions
export function hasAnyPermission(
  userRole: string,
  userPermissions: string[] | null | undefined,
  permissions: string[]
): boolean {
  if (userRole === 'SUPER_ADMIN') return true;
  if (userRole === 'STAFF') {
    return permissions.some((p) => userPermissions?.includes(p) ?? false);
  }
  return false;
}

// Get all permissions for a user (SUPER_ADMIN gets all, STAFF gets their assigned set)
export function getEffectivePermissions(
  userRole: string,
  userPermissions: string[] | null | undefined
): string[] {
  if (userRole === 'SUPER_ADMIN') return [...ALL_PERMISSIONS];
  if (userRole === 'STAFF') return userPermissions ?? [];
  return [];
}

// Human-readable label for a permission value
export function getPermissionLabel(value: string): string {
  for (const group of PERMISSION_GROUPS) {
    const perm = group.permissions.find((p) => p.value === value);
    if (perm) return perm.label;
  }
  return value;
}

// Get the module name for a permission value
export function getPermissionModule(value: string): string {
  for (const group of PERMISSION_GROUPS) {
    if (group.permissions.some((p) => p.value === value)) return group.module;
  }
  return 'Unknown';
}
