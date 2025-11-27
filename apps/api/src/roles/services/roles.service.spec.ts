import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RolesService } from './roles.service';
import { RolesRepository } from '../repositories/roles.repository';
import { RoleType } from '@prisma/client';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let repository: {
    findAllRoles: ReturnType<typeof vi.fn>;
    findRoleById: ReturnType<typeof vi.fn>;
    findRoleByName: ReturnType<typeof vi.fn>;
    findAllPermissions: ReturnType<typeof vi.fn>;
    findPermissionsByModule: ReturnType<typeof vi.fn>;
    setRolePermissions: ReturnType<typeof vi.fn>;
    findUserRoleByTenant: ReturnType<typeof vi.fn>;
    findUserRoles: ReturnType<typeof vi.fn>;
    assignRoleToUser: ReturnType<typeof vi.fn>;
    removeAllUserRolesInTenant: ReturnType<typeof vi.fn>;
    findTenantMembers: ReturnType<typeof vi.fn>;
    findUsersWithRole: ReturnType<typeof vi.fn>;
    hasPermission: ReturnType<typeof vi.fn>;
    getUserPermissions: ReturnType<typeof vi.fn>;
  };

  const mockRole = {
    id: 'role-1',
    name: RoleType.OWNER,
    description: 'Owner role',
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    permissions: [],
  };

  const mockUserRole = {
    id: 'user-role-1',
    userId: 'user-1',
    roleId: 'role-1',
    tenantId: 'tenant-1',
    assignedBy: 'system',
    assignedAt: new Date(),
    expiresAt: null,
    role: mockRole,
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const mockRepository = {
      findAllRoles: vi.fn(),
      findRoleById: vi.fn(),
      findRoleByName: vi.fn(),
      findAllPermissions: vi.fn(),
      findPermissionsByModule: vi.fn(),
      setRolePermissions: vi.fn(),
      findUserRoleByTenant: vi.fn(),
      findUserRoles: vi.fn(),
      assignRoleToUser: vi.fn(),
      removeAllUserRolesInTenant: vi.fn(),
      findTenantMembers: vi.fn(),
      findUsersWithRole: vi.fn(),
      hasPermission: vi.fn(),
      getUserPermissions: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RolesRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repository = module.get(RolesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      repository.findAllRoles.mockResolvedValue([mockRole]);

      const result = await service.getAllRoles();

      expect(result).toEqual([mockRole]);
      expect(repository.findAllRoles).toHaveBeenCalled();
    });
  });

  describe('getRoleById', () => {
    it('should return role by id', async () => {
      repository.findRoleById.mockResolvedValue(mockRole);

      const result = await service.getRoleById('role-1');

      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException if role not found', async () => {
      repository.findRoleById.mockResolvedValue(null);

      await expect(service.getRoleById('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getRoleByName', () => {
    it('should return role by name', async () => {
      repository.findRoleByName.mockResolvedValue(mockRole);

      const result = await service.getRoleByName(RoleType.OWNER);

      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException if role not found', async () => {
      repository.findRoleByName.mockResolvedValue(null);

      await expect(service.getRoleByName(RoleType.OWNER)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserRole', () => {
    it('should return user role', async () => {
      repository.findUserRoleByTenant.mockResolvedValue(mockUserRole);

      const result = await service.getUserRole('user-1', 'tenant-1');

      expect(result).toEqual(mockUserRole);
    });

    it('should throw NotFoundException if user has no role', async () => {
      repository.findUserRoleByTenant.mockResolvedValue(null);

      await expect(service.getUserRole('user-1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign role to user', async () => {
      repository.findRoleByName.mockResolvedValue(mockRole);
      repository.assignRoleToUser.mockResolvedValue(mockUserRole);

      const result = await service.assignRoleToUser(
        'user-1',
        RoleType.OWNER,
        'tenant-1',
        'assigner-1',
      );

      expect(result).toEqual(mockUserRole);
      expect(repository.assignRoleToUser).toHaveBeenCalledWith(
        'user-1',
        'role-1',
        'tenant-1',
        'assigner-1',
        undefined,
      );
    });

    it('should throw NotFoundException if role not found', async () => {
      repository.findRoleByName.mockResolvedValue(null);

      await expect(
        service.assignRoleToUser('user-1', RoleType.OWNER, 'tenant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('changeUserRole', () => {
    const ownerUserRole = {
      ...mockUserRole,
      role: { ...mockRole, name: RoleType.OWNER },
    };

    const adminUserRole = {
      ...mockUserRole,
      role: { ...mockRole, name: RoleType.ADMIN },
    };

    it('should change user role when assigner is OWNER', async () => {
      repository.findUserRoleByTenant
        .mockResolvedValueOnce(ownerUserRole) // assigner role
        .mockResolvedValueOnce(adminUserRole); // target user role
      repository.findRoleByName.mockResolvedValue({
        ...mockRole,
        name: RoleType.MEMBER,
      });
      repository.removeAllUserRolesInTenant.mockResolvedValue({ count: 1 });
      repository.assignRoleToUser.mockResolvedValue(mockUserRole);

      await service.changeUserRole(
        'user-2',
        RoleType.MEMBER,
        'tenant-1',
        'user-1',
      );

      expect(repository.removeAllUserRolesInTenant).toHaveBeenCalled();
      expect(repository.assignRoleToUser).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if assigner has no role', async () => {
      repository.findUserRoleByTenant.mockResolvedValue(null);

      await expect(
        service.changeUserRole('user-2', RoleType.MEMBER, 'tenant-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if ADMIN tries to promote to OWNER', async () => {
      repository.findUserRoleByTenant.mockResolvedValue(adminUserRole);

      await expect(
        service.changeUserRole('user-2', RoleType.OWNER, 'tenant-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if user tries to change own role', async () => {
      repository.findUserRoleByTenant.mockResolvedValue(ownerUserRole);

      await expect(
        service.changeUserRole('user-1', RoleType.MEMBER, 'tenant-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('isOwner', () => {
    it('should return true if user is OWNER', async () => {
      repository.findUserRoleByTenant.mockResolvedValue({
        ...mockUserRole,
        role: { ...mockRole, name: RoleType.OWNER },
      });

      const result = await service.isOwner('user-1', 'tenant-1');

      expect(result).toBe(true);
    });

    it('should return false if user is not OWNER', async () => {
      repository.findUserRoleByTenant.mockResolvedValue({
        ...mockUserRole,
        role: { ...mockRole, name: RoleType.MEMBER },
      });

      const result = await service.isOwner('user-1', 'tenant-1');

      expect(result).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true if user is OWNER', async () => {
      repository.findUserRoleByTenant.mockResolvedValue({
        ...mockUserRole,
        role: { ...mockRole, name: RoleType.OWNER },
      });

      const result = await service.isAdmin('user-1', 'tenant-1');

      expect(result).toBe(true);
    });

    it('should return true if user is ADMIN', async () => {
      repository.findUserRoleByTenant.mockResolvedValue({
        ...mockUserRole,
        role: { ...mockRole, name: RoleType.ADMIN },
      });

      const result = await service.isAdmin('user-1', 'tenant-1');

      expect(result).toBe(true);
    });

    it('should return false if user is MEMBER', async () => {
      repository.findUserRoleByTenant.mockResolvedValue({
        ...mockUserRole,
        role: { ...mockRole, name: RoleType.MEMBER },
      });

      const result = await service.isAdmin('user-1', 'tenant-1');

      expect(result).toBe(false);
    });
  });

  describe('isAtLeast', () => {
    it('should return true if user has higher role than minimum', async () => {
      repository.findUserRoleByTenant.mockResolvedValue({
        ...mockUserRole,
        role: { ...mockRole, name: RoleType.ADMIN },
      });

      const result = await service.isAtLeast(
        'user-1',
        'tenant-1',
        RoleType.MEMBER,
      );

      expect(result).toBe(true);
    });

    it('should return true if user has same role as minimum', async () => {
      repository.findUserRoleByTenant.mockResolvedValue({
        ...mockUserRole,
        role: { ...mockRole, name: RoleType.MEMBER },
      });

      const result = await service.isAtLeast(
        'user-1',
        'tenant-1',
        RoleType.MEMBER,
      );

      expect(result).toBe(true);
    });

    it('should return false if user has lower role than minimum', async () => {
      repository.findUserRoleByTenant.mockResolvedValue({
        ...mockUserRole,
        role: { ...mockRole, name: RoleType.VIEWER },
      });

      const result = await service.isAtLeast(
        'user-1',
        'tenant-1',
        RoleType.MEMBER,
      );

      expect(result).toBe(false);
    });

    it('should return false if user has no role', async () => {
      repository.findUserRoleByTenant.mockResolvedValue(null);

      const result = await service.isAtLeast(
        'user-1',
        'tenant-1',
        RoleType.MEMBER,
      );

      expect(result).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should delegate to repository', async () => {
      repository.hasPermission.mockResolvedValue(true);

      const result = await service.hasPermission(
        'user-1',
        'tenant-1',
        'jobs:read',
      );

      expect(result).toBe(true);
      expect(repository.hasPermission).toHaveBeenCalledWith(
        'user-1',
        'tenant-1',
        'jobs:read',
      );
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions', async () => {
      repository.getUserPermissions.mockResolvedValue([
        'jobs:read',
        'jobs:write',
      ]);

      const result = await service.getUserPermissions('user-1', 'tenant-1');

      expect(result).toEqual(['jobs:read', 'jobs:write']);
    });
  });
});
