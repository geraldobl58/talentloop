import {
  RoleType,
  PermissionModule,
  PermissionAction,
  type PermissionString,
} from "./types";

/**
 * Role Hierarchy
 * Higher number = more permissions
 */
export const ROLE_HIERARCHY: Record<RoleType, number> = {
  [RoleType.OWNER]: 5,
  [RoleType.ADMIN]: 4,
  [RoleType.MANAGER]: 3,
  [RoleType.MEMBER]: 2,
  [RoleType.VIEWER]: 1,
};

/**
 * Role Labels (PT-BR)
 */
export const ROLE_LABELS: Record<RoleType, string> = {
  [RoleType.OWNER]: "Proprietário",
  [RoleType.ADMIN]: "Administrador",
  [RoleType.MANAGER]: "Gerente",
  [RoleType.MEMBER]: "Membro",
  [RoleType.VIEWER]: "Visualizador",
};

/**
 * Role Descriptions (PT-BR)
 */
export const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  [RoleType.OWNER]:
    "Acesso total ao sistema, incluindo faturamento e exclusão de conta",
  [RoleType.ADMIN]:
    "Gerencia usuários e configurações, sem acesso a faturamento",
  [RoleType.MANAGER]: "Acesso a relatórios e configurações limitadas",
  [RoleType.MEMBER]: "Acesso básico às funcionalidades do sistema",
  [RoleType.VIEWER]: "Apenas visualização, sem permissão de edição",
};

/**
 * Role Colors (for UI)
 */
export const ROLE_COLORS: Record<RoleType, string> = {
  [RoleType.OWNER]: "#8B5CF6", // Purple
  [RoleType.ADMIN]: "#3B82F6", // Blue
  [RoleType.MANAGER]: "#10B981", // Green
  [RoleType.MEMBER]: "#6B7280", // Gray
  [RoleType.VIEWER]: "#9CA3AF", // Light gray
};

/**
 * Role Badge Variants (for shadcn/ui)
 */
export const ROLE_BADGE_VARIANTS: Record<
  RoleType,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [RoleType.OWNER]: "default",
  [RoleType.ADMIN]: "default",
  [RoleType.MANAGER]: "secondary",
  [RoleType.MEMBER]: "outline",
  [RoleType.VIEWER]: "outline",
};

/**
 * All available permissions in the system
 */
export const ALL_PERMISSIONS: PermissionString[] = [
  // Jobs
  "jobs:read",
  "jobs:write",
  "jobs:delete",
  // Applications
  "applications:read",
  "applications:write",
  "applications:delete",
  // Profile
  "profile:read",
  "profile:write",
  // Users
  "users:read",
  "users:write",
  "users:delete",
  "users:manage",
  // Settings
  "settings:read",
  "settings:write",
  // Billing
  "billing:read",
  "billing:manage",
  // AutoApply
  "autoapply:read",
  "autoapply:write",
  // Recruiter CRM
  "recruiter:read",
  "recruiter:write",
  // Reports
  "reports:read",
  "reports:export",
];

/**
 * Permission Labels (PT-BR)
 */
export const PERMISSION_LABELS: Record<string, string> = {
  // Jobs
  "jobs:read": "Visualizar vagas",
  "jobs:write": "Criar e editar vagas",
  "jobs:delete": "Excluir vagas",
  // Applications
  "applications:read": "Visualizar candidaturas",
  "applications:write": "Criar e editar candidaturas",
  "applications:delete": "Excluir candidaturas",
  // Profile
  "profile:read": "Visualizar perfil",
  "profile:write": "Editar perfil",
  // Users
  "users:read": "Visualizar usuários do time",
  "users:write": "Criar e editar usuários",
  "users:delete": "Remover usuários",
  "users:manage": "Gerenciar roles de usuários",
  // Settings
  "settings:read": "Visualizar configurações",
  "settings:write": "Editar configurações",
  // Billing
  "billing:read": "Visualizar faturamento",
  "billing:manage": "Gerenciar assinatura",
  // AutoApply
  "autoapply:read": "Visualizar AutoApply",
  "autoapply:write": "Configurar AutoApply",
  // Recruiter CRM
  "recruiter:read": "Visualizar contatos de recrutadores",
  "recruiter:write": "Gerenciar contatos de recrutadores",
  // Reports
  "reports:read": "Visualizar relatórios",
  "reports:export": "Exportar relatórios",
};

/**
 * Module Labels (PT-BR)
 */
export const MODULE_LABELS: Record<PermissionModule, string> = {
  [PermissionModule.JOBS]: "Vagas",
  [PermissionModule.APPLICATIONS]: "Candidaturas",
  [PermissionModule.PROFILE]: "Perfil",
  [PermissionModule.USERS]: "Usuários",
  [PermissionModule.SETTINGS]: "Configurações",
  [PermissionModule.BILLING]: "Faturamento",
  [PermissionModule.AUTOAPPLY]: "AutoApply",
  [PermissionModule.RECRUITER]: "Recrutadores",
  [PermissionModule.REPORTS]: "Relatórios",
};

/**
 * Default permissions for each role
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleType, PermissionString[]> = {
  [RoleType.OWNER]: ALL_PERMISSIONS,

  [RoleType.ADMIN]: ALL_PERMISSIONS.filter((p) => p !== "billing:manage"),

  [RoleType.MANAGER]: [
    "jobs:read",
    "applications:read",
    "applications:write",
    "profile:read",
    "profile:write",
    "users:read",
    "settings:read",
    "billing:read",
    "autoapply:read",
    "autoapply:write",
    "recruiter:read",
    "recruiter:write",
    "reports:read",
    "reports:export",
  ],

  [RoleType.MEMBER]: [
    "jobs:read",
    "jobs:write",
    "applications:read",
    "applications:write",
    "profile:read",
    "profile:write",
    "autoapply:read",
    "autoapply:write",
    "recruiter:read",
    "recruiter:write",
  ],

  [RoleType.VIEWER]: [
    "jobs:read",
    "applications:read",
    "profile:read",
    "users:read",
    "settings:read",
    "billing:read",
    "autoapply:read",
    "recruiter:read",
    "reports:read",
  ],
};

/**
 * Roles that can be assigned by each role
 */
export const ASSIGNABLE_ROLES: Record<RoleType, RoleType[]> = {
  [RoleType.OWNER]: [
    RoleType.ADMIN,
    RoleType.MANAGER,
    RoleType.MEMBER,
    RoleType.VIEWER,
  ],
  [RoleType.ADMIN]: [RoleType.MANAGER, RoleType.MEMBER, RoleType.VIEWER],
  [RoleType.MANAGER]: [],
  [RoleType.MEMBER]: [],
  [RoleType.VIEWER]: [],
};
