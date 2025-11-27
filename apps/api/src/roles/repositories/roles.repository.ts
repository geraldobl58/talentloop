import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../libs/prisma/prisma.service';
import { RoleType, Prisma } from '@prisma/client';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ========================================
  // Role Operations
  // ========================================

  async findAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findRoleById(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findRoleByName(name: RoleType) {
    return this.prisma.role.findUnique({
      where: { name },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async createRole(data: Prisma.RoleCreateInput) {
    return this.prisma.role.create({
      data,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async updateRole(id: string, data: Prisma.RoleUpdateInput) {
    return this.prisma.role.update({
      where: { id },
      data,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async deleteRole(id: string) {
    return this.prisma.role.delete({
      where: { id },
    });
  }

  // ========================================
  // Permission Operations
  // ========================================

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }

  async findPermissionById(id: string) {
    return this.prisma.permission.findUnique({
      where: { id },
    });
  }

  async findPermissionByName(name: string) {
    return this.prisma.permission.findUnique({
      where: { name },
    });
  }

  async findPermissionsByModule(module: string) {
    return this.prisma.permission.findMany({
      where: { module },
      orderBy: { action: 'asc' },
    });
  }

  async createPermission(data: Prisma.PermissionCreateInput) {
    return this.prisma.permission.create({ data });
  }

  async createManyPermissions(data: Prisma.PermissionCreateManyInput[]) {
    return this.prisma.permission.createMany({
      data,
      skipDuplicates: true,
    });
  }

  // ========================================
  // Role-Permission Operations
  // ========================================

  async assignPermissionToRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.create({
      data: { roleId, permissionId },
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });
  }

  async setRolePermissions(roleId: string, permissionIds: string[]) {
    // Remove todas as permissões existentes e adiciona as novas
    return this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }

      return tx.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });
  }

  // ========================================
  // User Role Operations
  // ========================================

  async findUserRoles(userId: string, tenantId: string) {
    return this.prisma.userRole.findMany({
      where: { userId, tenantId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async findUserRoleByTenant(userId: string, tenantId: string) {
    return this.prisma.userRole.findFirst({
      where: { userId, tenantId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async assignRoleToUser(
    userId: string,
    roleId: string,
    tenantId: string,
    assignedBy?: string,
    expiresAt?: Date,
  ) {
    return this.prisma.userRole.upsert({
      where: {
        userId_roleId_tenantId: { userId, roleId, tenantId },
      },
      create: {
        userId,
        roleId,
        tenantId,
        assignedBy,
        expiresAt,
      },
      update: {
        assignedBy,
        expiresAt,
        assignedAt: new Date(),
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async removeRoleFromUser(userId: string, roleId: string, tenantId: string) {
    return this.prisma.userRole.delete({
      where: {
        userId_roleId_tenantId: { userId, roleId, tenantId },
      },
    });
  }

  async removeAllUserRolesInTenant(userId: string, tenantId: string) {
    return this.prisma.userRole.deleteMany({
      where: { userId, tenantId },
    });
  }

  async findUsersWithRole(roleId: string, tenantId: string) {
    return this.prisma.userRole.findMany({
      where: { roleId, tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async findTenantMembers(tenantId: string) {
    return this.prisma.userRole.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isActive: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: [{ role: { name: 'asc' } }, { user: { name: 'asc' } }],
    });
  }

  async countUsersWithRole(roleId: string, tenantId: string) {
    return this.prisma.userRole.count({
      where: { roleId, tenantId },
    });
  }

  async hasPermission(
    userId: string,
    tenantId: string,
    permissionName: string,
  ) {
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        tenantId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!userRole) return false;

    return userRole.role.permissions.some(
      (rp) => rp.permission.name === permissionName,
    );
  }

  async getUserPermissions(userId: string, tenantId: string) {
    const userRole = await this.findUserRoleByTenant(userId, tenantId);

    if (!userRole) return [];

    return userRole.role.permissions.map((rp) => rp.permission.name);
  }
}
