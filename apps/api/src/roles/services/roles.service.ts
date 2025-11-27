import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { RolesRepository } from '../repositories/roles.repository';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  // ========================================
  // Role Operations
  // ========================================

  async getAllRoles() {
    return this.rolesRepository.findAllRoles();
  }

  async getRoleById(id: string) {
    const role = await this.rolesRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException('Role não encontrada');
    }
    return role;
  }

  async getRoleByName(name: RoleType) {
    const role = await this.rolesRepository.findRoleByName(name);
    if (!role) {
      throw new NotFoundException(`Role ${name} não encontrada`);
    }
    return role;
  }

  // ========================================
  // Permission Operations
  // ========================================

  async getAllPermissions() {
    return this.rolesRepository.findAllPermissions();
  }

  async getPermissionsByModule(module: string) {
    return this.rolesRepository.findPermissionsByModule(module);
  }

  async setRolePermissions(roleId: string, permissionIds: string[]) {
    const role = await this.rolesRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundException('Role não encontrada');
    }

    return this.rolesRepository.setRolePermissions(roleId, permissionIds);
  }

  // ========================================
  // User Role Operations
  // ========================================

  async getUserRole(userId: string, tenantId: string) {
    const userRole = await this.rolesRepository.findUserRoleByTenant(
      userId,
      tenantId,
    );
    if (!userRole) {
      throw new NotFoundException('Usuário não possui role neste tenant');
    }
    return userRole;
  }

  async assignRoleToUser(
    userId: string,
    roleName: RoleType,
    tenantId: string,
    assignedBy?: string,
    expiresAt?: Date,
  ) {
    const role = await this.rolesRepository.findRoleByName(roleName);
    if (!role) {
      throw new NotFoundException(`Role ${roleName} não encontrada`);
    }

    return this.rolesRepository.assignRoleToUser(
      userId,
      role.id,
      tenantId,
      assignedBy,
      expiresAt,
    );
  }

  async changeUserRole(
    userId: string,
    newRoleName: RoleType,
    tenantId: string,
    assignedBy: string,
  ) {
    // Verificar se quem está alterando tem permissão
    const assignerRole = await this.rolesRepository.findUserRoleByTenant(
      assignedBy,
      tenantId,
    );

    if (!assignerRole) {
      throw new ForbiddenException('Você não tem permissão para alterar roles');
    }

    // Apenas OWNER e ADMIN podem alterar roles
    if (
      assignerRole.role.name !== RoleType.OWNER &&
      assignerRole.role.name !== RoleType.ADMIN
    ) {
      throw new ForbiddenException('Você não tem permissão para alterar roles');
    }

    // ADMIN não pode promover alguém a OWNER
    if (
      assignerRole.role.name === RoleType.ADMIN &&
      newRoleName === RoleType.OWNER
    ) {
      throw new ForbiddenException(
        'Administradores não podem promover usuários a OWNER',
      );
    }

    // Não pode alterar o próprio role
    if (userId === assignedBy) {
      throw new BadRequestException('Você não pode alterar seu próprio role');
    }

    // Buscar a nova role
    const newRole = await this.rolesRepository.findRoleByName(newRoleName);
    if (!newRole) {
      throw new NotFoundException(`Role ${newRoleName} não encontrada`);
    }

    // Remover role atual e adicionar nova
    await this.rolesRepository.removeAllUserRolesInTenant(userId, tenantId);

    return this.rolesRepository.assignRoleToUser(
      userId,
      newRole.id,
      tenantId,
      assignedBy,
    );
  }

  async removeUserFromTenant(
    userId: string,
    tenantId: string,
    removedBy: string,
  ) {
    // Verificar se quem está removendo tem permissão
    const removerRole = await this.rolesRepository.findUserRoleByTenant(
      removedBy,
      tenantId,
    );

    if (!removerRole) {
      throw new ForbiddenException(
        'Você não tem permissão para remover usuários',
      );
    }

    // Apenas OWNER e ADMIN podem remover usuários
    if (
      removerRole.role.name !== RoleType.OWNER &&
      removerRole.role.name !== RoleType.ADMIN
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para remover usuários',
      );
    }

    // Verificar role do usuário sendo removido
    const userRole = await this.rolesRepository.findUserRoleByTenant(
      userId,
      tenantId,
    );

    if (!userRole) {
      throw new NotFoundException('Usuário não encontrado neste tenant');
    }

    // ADMIN não pode remover OWNER
    if (
      removerRole.role.name === RoleType.ADMIN &&
      userRole.role.name === RoleType.OWNER
    ) {
      throw new ForbiddenException(
        'Administradores não podem remover o proprietário',
      );
    }

    // Não pode remover a si mesmo
    if (userId === removedBy) {
      throw new BadRequestException('Você não pode remover a si mesmo');
    }

    return this.rolesRepository.removeAllUserRolesInTenant(userId, tenantId);
  }

  async getTenantMembers(tenantId: string) {
    return this.rolesRepository.findTenantMembers(tenantId);
  }

  async getUsersWithRole(roleId: string, tenantId: string) {
    return this.rolesRepository.findUsersWithRole(roleId, tenantId);
  }

  // ========================================
  // Permission Checks
  // ========================================

  async hasPermission(
    userId: string,
    tenantId: string,
    permissionName: string,
  ): Promise<boolean> {
    return this.rolesRepository.hasPermission(userId, tenantId, permissionName);
  }

  async getUserPermissions(
    userId: string,
    tenantId: string,
  ): Promise<string[]> {
    return this.rolesRepository.getUserPermissions(userId, tenantId);
  }

  async isOwner(userId: string, tenantId: string): Promise<boolean> {
    const userRole = await this.rolesRepository.findUserRoleByTenant(
      userId,
      tenantId,
    );
    return userRole?.role.name === RoleType.OWNER;
  }

  async isAdmin(userId: string, tenantId: string): Promise<boolean> {
    const userRole = await this.rolesRepository.findUserRoleByTenant(
      userId,
      tenantId,
    );
    return (
      userRole?.role.name === RoleType.OWNER ||
      userRole?.role.name === RoleType.ADMIN
    );
  }

  async isAtLeast(
    userId: string,
    tenantId: string,
    minimumRole: RoleType,
  ): Promise<boolean> {
    const userRole = await this.rolesRepository.findUserRoleByTenant(
      userId,
      tenantId,
    );

    if (!userRole) return false;

    const roleHierarchy: Record<RoleType, number> = {
      [RoleType.OWNER]: 5,
      [RoleType.ADMIN]: 4,
      [RoleType.MANAGER]: 3,
      [RoleType.MEMBER]: 2,
      [RoleType.VIEWER]: 1,
    };

    const userRoleLevel = roleHierarchy[userRole.role.name];
    const minimumRoleLevel = roleHierarchy[minimumRole];

    return userRoleLevel >= minimumRoleLevel;
  }
}
