import { RoleType, type PermissionString } from "./types";
import {
  ROLE_HIERARCHY,
  DEFAULT_ROLE_PERMISSIONS,
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
  PERMISSION_LABELS,
} from "./constants";

/**
 * Check if a role is higher or equal to another role
 */
export function isRoleAtLeast(
  userRole: RoleType,
  minimumRole: RoleType
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Check if a role is higher than another role
 */
export function isRoleHigherThan(
  userRole: RoleType,
  otherRole: RoleType
): boolean {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[otherRole];
}

/**
 * Compare two roles
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareRoles(a: RoleType, b: RoleType): -1 | 0 | 1 {
  const diff = ROLE_HIERARCHY[a] - ROLE_HIERARCHY[b];
  if (diff < 0) return -1;
  if (diff > 0) return 1;
  return 0;
}

/**
 * Get the highest role from a list
 */
export function getHighestRole(roles: RoleType[]): RoleType | null {
  if (roles.length === 0) return null;
  return roles.reduce((highest, current) =>
    ROLE_HIERARCHY[current] > ROLE_HIERARCHY[highest] ? current : highest
  );
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(
  role: RoleType,
  permission: PermissionString
): boolean {
  return DEFAULT_ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if user has a permission from their permissions list
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: PermissionString
): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: PermissionString[]
): boolean {
  return requiredPermissions.every((p) => userPermissions.includes(p));
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: PermissionString[]
): boolean {
  return requiredPermissions.some((p) => userPermissions.includes(p));
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: RoleType): PermissionString[] {
  return [...DEFAULT_ROLE_PERMISSIONS[role]];
}

/**
 * Check if a role can assign another role
 */
export function canAssignRole(
  assignerRole: RoleType,
  targetRole: RoleType
): boolean {
  return ASSIGNABLE_ROLES[assignerRole].includes(targetRole);
}

/**
 * Check if user can manage another user based on role hierarchy
 */
export function canManageUser(
  managerRole: RoleType,
  targetRole: RoleType
): boolean {
  // Must be at least ADMIN to manage users
  if (!isRoleAtLeast(managerRole, RoleType.ADMIN)) {
    return false;
  }
  // Can only manage users with lower roles
  return isRoleHigherThan(managerRole, targetRole);
}

/**
 * Get role display label
 */
export function getRoleLabel(role: RoleType): string {
  return ROLE_LABELS[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: RoleType): string {
  return ROLE_DESCRIPTIONS[role];
}

/**
 * Get role color
 */
export function getRoleColor(role: RoleType): string {
  return ROLE_COLORS[role];
}

/**
 * Get permission label
 */
export function getPermissionLabel(permission: string): string {
  return PERMISSION_LABELS[permission] || permission;
}

/**
 * Parse permission string into module and action
 */
export function parsePermission(permission: string): {
  module: string;
  action: string;
} {
  const [module, action] = permission.split(":");
  return { module: module || "", action: action || "" };
}

/**
 * Build permission string from module and action
 */
export function buildPermission(
  module: string,
  action: string
): PermissionString {
  return `${module}:${action}` as PermissionString;
}

/**
 * Group permissions by module
 */
export function groupPermissionsByModule(
  permissions: string[]
): Record<string, string[]> {
  return permissions.reduce(
    (acc, permission) => {
      const { module, action } = parsePermission(permission);
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(action);
      return acc;
    },
    {} as Record<string, string[]>
  );
}

/**
 * Get all roles as array (ordered by hierarchy desc)
 */
export function getAllRoles(): RoleType[] {
  return Object.values(RoleType).sort(
    (a, b) => ROLE_HIERARCHY[b] - ROLE_HIERARCHY[a]
  );
}

/**
 * Get assignable roles for a given role
 */
export function getAssignableRoles(role: RoleType): RoleType[] {
  return [...ASSIGNABLE_ROLES[role]];
}

// ============================================
// Frontend Protection Utilities
// ============================================

/**
 * Check if user has one of the required roles
 * Useful for protecting routes, menu items, and UI elements
 *
 * @example
 * // Check if user can access admin features
 * if (hasRequiredRole(user.role, [RoleType.OWNER, RoleType.ADMIN])) {
 *   // Show admin menu
 * }
 */
export function hasRequiredRole(
  userRole: RoleType | null | undefined,
  requiredRoles: RoleType[]
): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Check if user has at least the minimum role (uses hierarchy)
 * OWNER > ADMIN > MANAGER > MEMBER > VIEWER
 *
 * @example
 * // Check if user is at least a MANAGER
 * if (hasMinimumRole(user.role, RoleType.MANAGER)) {
 *   // Show manager features
 * }
 */
export function hasMinimumRole(
  userRole: RoleType | null | undefined,
  minimumRole: RoleType
): boolean {
  if (!userRole) return false;
  return isRoleAtLeast(userRole, minimumRole);
}

/**
 * Filter menu items based on user role
 *
 * @example
 * const visibleMenuItems = filterMenuByRole(menuItems, user.role);
 */
export function filterMenuByRole<T extends { roles?: RoleType[] }>(
  items: T[],
  userRole: RoleType | null | undefined
): T[] {
  return items.filter((item) => {
    // If no roles specified, item is visible to all
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    // Check if user has one of the required roles
    return hasRequiredRole(userRole, item.roles);
  });
}

/**
 * Check if a route/feature should be accessible
 * Returns true if no roles required OR user has required role
 */
export function canAccess(
  userRole: RoleType | null | undefined,
  requiredRoles?: RoleType[]
): boolean {
  // No restriction - everyone can access
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  return hasRequiredRole(userRole, requiredRoles);
}
