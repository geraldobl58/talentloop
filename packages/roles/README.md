# @talentloop/roles

Shared RBAC (Role-Based Access Control) package for TalentLoop. This package provides types, constants, and utilities that can be used in both frontend (React/Next.js) and backend (NestJS) applications.

## Installation

This package is part of the TalentLoop monorepo and is automatically available to workspace apps.

```bash
# In your app's package.json, add:
"@talentloop/roles": "workspace:*"

# Then run:
pnpm install
```

## Usage

### Import Types

```typescript
import {
  RoleType,
  Permission,
  UserRole,
  PermissionString,
} from "@talentloop/roles";

// RoleType enum
const role: RoleType = RoleType.ADMIN;

// Permission type
const permission: PermissionString = "jobs:read";
```

### Import Constants

```typescript
import {
  ROLE_HIERARCHY,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
  DEFAULT_ROLE_PERMISSIONS,
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  ASSIGNABLE_ROLES,
} from "@talentloop/roles";

// Get role hierarchy (higher = more permissions)
console.log(ROLE_HIERARCHY[RoleType.ADMIN]); // 4

// Get role label (PT-BR)
console.log(ROLE_LABELS[RoleType.ADMIN]); // "Administrador"

// Get default permissions for a role
console.log(DEFAULT_ROLE_PERMISSIONS[RoleType.MEMBER]);
// ['jobs:read', 'jobs:write', 'applications:read', ...]
```

### Import Utilities

```typescript
import {
  isRoleAtLeast,
  isRoleHigherThan,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  canManageUser,
  canAssignRole,
  getRoleLabel,
  groupPermissionsByModule,
} from "@talentloop/roles";

// Check if user has minimum role level
if (isRoleAtLeast(userRole, RoleType.ADMIN)) {
  // User is ADMIN or OWNER
}

// Check if user can manage another user
if (canManageUser(managerRole, targetRole)) {
  // Manager can manage target
}

// Check permissions
if (hasPermission(userPermissions, "users:manage")) {
  // User can manage other users
}

// Check multiple permissions
if (hasAllPermissions(userPermissions, ["jobs:read", "jobs:write"])) {
  // User has all required permissions
}
```

### Type Guards

```typescript
import {
  isValidRole,
  isValidPermission,
  parseRole,
  filterValidPermissions,
} from "@talentloop/roles";

// Validate unknown value
if (isValidRole(unknownValue)) {
  // unknownValue is RoleType
}

// Parse and validate
const role = parseRole(request.params.role);
if (role) {
  // role is valid RoleType
}

// Filter valid permissions from API response
const validPermissions = filterValidPermissions(apiResponse.permissions);
```

## Role Hierarchy

| Role    | Level | Description                                                |
| ------- | ----- | ---------------------------------------------------------- |
| OWNER   | 5     | Full system access, including billing and account deletion |
| ADMIN   | 4     | User management, settings, no billing access               |
| MANAGER | 3     | Reports, limited settings access                           |
| MEMBER  | 2     | Basic system functionality                                 |
| VIEWER  | 1     | Read-only access                                           |

## Permission Modules

| Module       | Permissions                                                      |
| ------------ | ---------------------------------------------------------------- |
| jobs         | `jobs:read`, `jobs:write`, `jobs:delete`                         |
| applications | `applications:read`, `applications:write`, `applications:delete` |
| profile      | `profile:read`, `profile:write`                                  |
| users        | `users:read`, `users:write`, `users:delete`, `users:manage`      |
| settings     | `settings:read`, `settings:write`                                |
| billing      | `billing:read`, `billing:manage`                                 |
| autoapply    | `autoapply:read`, `autoapply:write`                              |
| recruiter    | `recruiter:read`, `recruiter:write`                              |
| reports      | `reports:read`, `reports:export`                                 |

## Default Role Permissions

### OWNER

All permissions including `billing:manage`.

### ADMIN

All permissions except `billing:manage`.

### MANAGER

- Read/write access to applications, profile, autoapply, recruiter
- Read-only access to jobs, users, settings, billing
- Reports read and export

### MEMBER

- Read/write access to jobs, applications, profile, autoapply, recruiter
- No access to users, settings, billing, reports

### VIEWER

- Read-only access to all modules except profile write

## Frontend Usage Example

### React Component

```tsx
import {
  RoleType,
  getRoleLabel,
  getRoleColor,
  ROLE_BADGE_VARIANTS,
} from "@talentloop/roles";
import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: RoleType;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge
      variant={ROLE_BADGE_VARIANTS[role]}
      style={{ backgroundColor: getRoleColor(role) }}
    >
      {getRoleLabel(role)}
    </Badge>
  );
}
```

### Permission Check Hook

```tsx
import {
  hasPermission,
  hasAnyPermission,
  type PermissionString,
} from "@talentloop/roles";
import { useUser } from "@/hooks/useUser";

export function usePermissions() {
  const { user } = useUser();
  const permissions = user?.permissions ?? [];

  return {
    can: (permission: PermissionString) =>
      hasPermission(permissions, permission),
    canAny: (...perms: PermissionString[]) =>
      hasAnyPermission(permissions, perms),
  };
}

// Usage
function JobsPage() {
  const { can } = usePermissions();

  return (
    <div>
      {can("jobs:write") && <CreateJobButton />}
      {can("jobs:delete") && <DeleteJobButton />}
    </div>
  );
}
```

## Backend Usage Example

### NestJS Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleType, isRoleAtLeast } from "@talentloop/roles";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<RoleType>(
      "role",
      context.getHandler()
    );
    if (!requiredRole) return true;

    const { user } = context.switchToHttp().getRequest();
    return isRoleAtLeast(user.role, requiredRole);
  }
}
```

### NestJS Decorator

```typescript
import { SetMetadata } from "@nestjs/common";
import { RoleType } from "@talentloop/roles";

export const RequireRole = (role: RoleType) => SetMetadata("role", role);

// Usage
@Controller("admin")
export class AdminController {
  @Get("users")
  @RequireRole(RoleType.ADMIN)
  getUsers() {
    // Only ADMIN and OWNER can access
  }
}
```

## API Reference

### Types

| Type               | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `RoleType`         | Enum with role values: OWNER, ADMIN, MANAGER, MEMBER, VIEWER |
| `PermissionModule` | Enum with module names                                       |
| `PermissionAction` | Enum with action names: read, write, delete, manage, export  |
| `PermissionString` | Type for permission strings like `'jobs:read'`               |
| `Role`             | Interface for Role entity                                    |
| `Permission`       | Interface for Permission entity                              |
| `UserRole`         | Interface for UserRole entity                                |

### Constants

| Constant                   | Type                                   | Description                  |
| -------------------------- | -------------------------------------- | ---------------------------- |
| `ROLE_HIERARCHY`           | `Record<RoleType, number>`             | Role levels (1-5)            |
| `ROLE_LABELS`              | `Record<RoleType, string>`             | Localized role names         |
| `ROLE_DESCRIPTIONS`        | `Record<RoleType, string>`             | Localized descriptions       |
| `ROLE_COLORS`              | `Record<RoleType, string>`             | Hex color codes              |
| `ROLE_BADGE_VARIANTS`      | `Record<RoleType, string>`             | shadcn/ui badge variants     |
| `ALL_PERMISSIONS`          | `PermissionString[]`                   | All system permissions       |
| `PERMISSION_LABELS`        | `Record<string, string>`               | Localized permission names   |
| `MODULE_LABELS`            | `Record<PermissionModule, string>`     | Localized module names       |
| `DEFAULT_ROLE_PERMISSIONS` | `Record<RoleType, PermissionString[]>` | Default permissions per role |
| `ASSIGNABLE_ROLES`         | `Record<RoleType, RoleType[]>`         | Which roles can assign which |

### Utility Functions

| Function                             | Description                             |
| ------------------------------------ | --------------------------------------- |
| `isRoleAtLeast(role, min)`           | Check if role >= minimum                |
| `isRoleHigherThan(role, other)`      | Check if role > other                   |
| `compareRoles(a, b)`                 | Compare two roles (-1, 0, 1)            |
| `getHighestRole(roles)`              | Get highest role from array             |
| `roleHasPermission(role, perm)`      | Check if role has permission by default |
| `hasPermission(perms, perm)`         | Check if user has permission            |
| `hasAllPermissions(perms, required)` | Check all permissions                   |
| `hasAnyPermission(perms, required)`  | Check any permission                    |
| `getPermissionsForRole(role)`        | Get default permissions for role        |
| `canAssignRole(assigner, target)`    | Check if can assign role                |
| `canManageUser(manager, target)`     | Check if can manage user                |
| `getRoleLabel(role)`                 | Get localized label                     |
| `getRoleDescription(role)`           | Get localized description               |
| `getRoleColor(role)`                 | Get hex color                           |
| `getPermissionLabel(perm)`           | Get localized permission label          |
| `parsePermission(perm)`              | Split into module and action            |
| `buildPermission(module, action)`    | Create permission string                |
| `groupPermissionsByModule(perms)`    | Group by module                         |
| `getAllRoles()`                      | Get all roles ordered by hierarchy      |
| `getAssignableRoles(role)`           | Get roles user can assign               |

### Type Guards

| Function                         | Description                            |
| -------------------------------- | -------------------------------------- |
| `isValidRole(value)`             | Check if value is valid RoleType       |
| `isValidPermission(value)`       | Check if value is valid permission     |
| `areValidPermissions(values)`    | Check if array has valid permissions   |
| `parseRole(value)`               | Parse string to RoleType or null       |
| `parsePermissionString(value)`   | Parse string to permission or null     |
| `filterValidPermissions(values)` | Filter array to valid permissions only |

## License

MIT © TalentLoop
