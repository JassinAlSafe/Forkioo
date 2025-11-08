/**
 * Role-Based Access Control (RBAC) Utilities
 *
 * Defines user roles and permission checking for Forkioo
 */

export const UserRole = {
  OWNER: "owner",
  ADMIN: "admin",
  ACCOUNTANT: "accountant",
  MEMBER: "member",
  VIEWER: "viewer",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/**
 * Role hierarchy for permission checks
 * Higher number = more permissions
 */
const roleHierarchy: Record<UserRoleType, number> = {
  owner: 5,
  admin: 4,
  accountant: 3,
  member: 2,
  viewer: 1,
};

/**
 * Check if user has minimum required role
 *
 * @example
 * requireRole("member", "admin") // false - member < admin
 * requireRole("owner", "admin") // true - owner >= admin
 */
export function requireRole(
  userRole: string,
  minRole: UserRoleType
): boolean {
  const userLevel = roleHierarchy[userRole as UserRoleType] || 0;
  const requiredLevel = roleHierarchy[minRole];
  return userLevel >= requiredLevel;
}

/**
 * Get role display name
 */
export function getRoleLabel(role: string): string {
  const labels: Record<UserRoleType, string> = {
    owner: "Owner",
    admin: "Administrator",
    accountant: "Accountant",
    member: "Member",
    viewer: "Viewer",
  };

  return labels[role as UserRoleType] || "Unknown";
}

/**
 * Get role description
 */
export function getRoleDescription(role: string): string {
  const descriptions: Record<UserRoleType, string> = {
    owner: "Full access to all features and settings",
    admin: "Manage users, settings, and all financial data",
    accountant: "Manage all financial data but cannot change settings",
    member: "Create and edit assigned records",
    viewer: "View-only access to financial data",
  };

  return descriptions[role as UserRoleType] || "Unknown role";
}

/**
 * Permission sets for each role
 */
export const defaultPermissions: Record<UserRoleType, Record<string, any>> = {
  owner: {
    invoices: { create: true, read: true, update: true, delete: true, send: true },
    expenses: { create: true, read: true, update: true, delete: true, approve: true },
    customers: { create: true, read: true, update: true, delete: true },
    accounts: { create: true, read: true, update: true, delete: true },
    transactions: { create: true, read: true, update: true, delete: true, void: true },
    reports: { read: true, export: true },
    settings: { read: true, update: true },
    users: { invite: true, manage: true, remove: true },
  },
  admin: {
    invoices: { create: true, read: true, update: true, delete: true, send: true },
    expenses: { create: true, read: true, update: true, delete: true, approve: true },
    customers: { create: true, read: true, update: true, delete: true },
    accounts: { create: true, read: true, update: true, delete: false },
    transactions: { create: true, read: true, update: true, delete: false, void: true },
    reports: { read: true, export: true },
    settings: { read: true, update: false },
    users: { invite: true, manage: false, remove: false },
  },
  accountant: {
    invoices: { create: true, read: true, update: true, delete: false, send: true },
    expenses: { create: true, read: true, update: true, delete: false, approve: true },
    customers: { create: true, read: true, update: true, delete: false },
    accounts: { create: false, read: true, update: false, delete: false },
    transactions: { create: true, read: true, update: true, delete: false, void: false },
    reports: { read: true, export: true },
    settings: { read: true, update: false },
    users: { invite: false, manage: false, remove: false },
  },
  member: {
    invoices: { create: true, read: true, update: true, delete: false, send: false },
    expenses: { create: true, read: true, update: true, delete: false, approve: false },
    customers: { create: true, read: true, update: true, delete: false },
    accounts: { create: false, read: true, update: false, delete: false },
    transactions: { create: false, read: true, update: false, delete: false, void: false },
    reports: { read: true, export: false },
    settings: { read: false, update: false },
    users: { invite: false, manage: false, remove: false },
  },
  viewer: {
    invoices: { create: false, read: true, update: false, delete: false, send: false },
    expenses: { create: false, read: true, update: false, delete: false, approve: false },
    customers: { create: false, read: true, update: false, delete: false },
    accounts: { create: false, read: true, update: false, delete: false },
    transactions: { create: false, read: true, update: false, delete: false, void: false },
    reports: { read: true, export: false },
    settings: { read: false, update: false },
    users: { invite: false, manage: false, remove: false },
  },
};

/**
 * Check specific permission for a role
 *
 * @example
 * hasPermission("member", "invoices", "delete") // false
 * hasPermission("admin", "invoices", "delete") // true
 */
export function hasPermission(
  role: string,
  resource: string,
  action: string
): boolean {
  const permissions = defaultPermissions[role as UserRoleType];
  if (!permissions) return false;

  const resourcePerms = permissions[resource];
  if (!resourcePerms) return false;

  return resourcePerms[action] === true;
}
