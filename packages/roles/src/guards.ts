import { RoleType, type PermissionString } from "./types";
import { ALL_PERMISSIONS } from "./constants";

/**
 * Type guard to check if a value is a valid RoleType
 */
export function isValidRole(value: unknown): value is RoleType {
  return (
    typeof value === "string" &&
    Object.values(RoleType).includes(value as RoleType)
  );
}

/**
 * Type guard to check if a value is a valid permission string
 */
export function isValidPermission(value: unknown): value is PermissionString {
  return (
    typeof value === "string" &&
    ALL_PERMISSIONS.includes(value as PermissionString)
  );
}

/**
 * Type guard to check if an array contains only valid permissions
 */
export function areValidPermissions(
  values: unknown[]
): values is PermissionString[] {
  return Array.isArray(values) && values.every(isValidPermission);
}

/**
 * Validate and parse a role string
 * Returns the RoleType if valid, null otherwise
 */
export function parseRole(value: string | null | undefined): RoleType | null {
  if (!value || !isValidRole(value)) {
    return null;
  }
  return value;
}

/**
 * Validate and parse a permission string
 * Returns the PermissionString if valid, null otherwise
 */
export function parsePermissionString(
  value: string | null | undefined
): PermissionString | null {
  if (!value || !isValidPermission(value)) {
    return null;
  }
  return value;
}

/**
 * Filter an array of strings to only valid permissions
 */
export function filterValidPermissions(values: string[]): PermissionString[] {
  return values.filter(isValidPermission) as PermissionString[];
}
