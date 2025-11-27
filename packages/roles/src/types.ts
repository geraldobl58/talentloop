/**
 * Role Types
 * Define os tipos de roles disponíveis no sistema
 */
export const RoleType = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  MEMBER: "MEMBER",
  VIEWER: "VIEWER",
} as const;

export type RoleType = (typeof RoleType)[keyof typeof RoleType];

/**
 * Permission Actions
 * Ações possíveis em cada módulo
 */
export const PermissionAction = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
  MANAGE: "manage",
  EXPORT: "export",
} as const;

export type PermissionAction =
  (typeof PermissionAction)[keyof typeof PermissionAction];

/**
 * Permission Modules
 * Módulos do sistema que possuem permissões
 */
export const PermissionModule = {
  JOBS: "jobs",
  APPLICATIONS: "applications",
  PROFILE: "profile",
  USERS: "users",
  SETTINGS: "settings",
  BILLING: "billing",
  AUTOAPPLY: "autoapply",
  RECRUITER: "recruiter",
  REPORTS: "reports",
} as const;

export type PermissionModule =
  (typeof PermissionModule)[keyof typeof PermissionModule];

/**
 * Permission string format: "module:action"
 */
export type PermissionString = `${PermissionModule}:${PermissionAction}`;

/**
 * Role interface
 */
export interface Role {
  id: string;
  name: RoleType;
  description?: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Permission interface
 */
export interface Permission {
  id: string;
  name: string;
  description?: string | null;
  module: string;
  action: string;
  createdAt: Date;
}

/**
 * Role with permissions
 */
export interface RoleWithPermissions extends Role {
  permissions: Array<{
    permission: Permission;
  }>;
}

/**
 * User Role assignment
 */
export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  tenantId: string;
  assignedBy?: string | null;
  assignedAt: Date;
  expiresAt?: Date | null;
  role: RoleWithPermissions;
}

/**
 * Current user with role info
 */
export interface CurrentUserRole {
  userId: string;
  email: string;
  name: string;
  tenantId: string;
  role: {
    id: string;
    name: RoleType;
  } | null;
  permissions?: string[];
}

/**
 * Team member display
 */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  isActive: boolean;
  createdAt: Date;
  role: {
    id: string;
    name: RoleType;
    description?: string | null;
  };
}
