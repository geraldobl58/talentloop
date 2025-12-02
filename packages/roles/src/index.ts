/**
 * @talentloop/roles
 *
 * Shared RBAC (Role-Based Access Control) types, constants,
 * and utilities for TalentLoop frontend and backend.
 *
 * @example
 * // Import types
 * import { RoleType, type PermissionString } from "@talentloop/roles";
 *
 * // Import utilities for frontend protection
 * import {
 *   hasRequiredRole,
 *   hasMinimumRole,
 *   filterMenuByRole,
 *   canAccess
 * } from "@talentloop/roles";
 *
 * // Import constants
 * import { ROLE_LABELS, ROLE_COLORS } from "@talentloop/roles";
 */

// Types
export * from "./types";

// Constants
export * from "./constants";

// Utilities
export * from "./utils";

// Guards (type guards)
export * from "./guards";
