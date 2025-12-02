import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { JwtAuthGuard } from '../libs/common/guards/jwt-auth.guard';
import {
  TenantIsolationGuard,
  CompaniesOnly,
} from '../libs/common/guards/tenant-isolation.guard';
import {
  GetCurrentUser,
  CurrentUser,
} from '../libs/common/decorators/current-user-decorator';
import { Roles } from '../libs/common/decorators/roles.decorator';
import { RolesGuard } from '../libs/common/guards/roles.guard';
import {
  AssignRoleDto,
  ChangeRoleDto,
  SetPermissionsDto,
  RemoveUserDto,
} from './dto/roles.dto';
import { RoleType } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, RolesGuard)
@CompaniesOnly() // Gestão de roles é exclusiva para empresas
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // ========================================
  // Role Endpoints (OWNER/ADMIN only)
  // ========================================

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all roles' })
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get('permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all permissions' })
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async getAllPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @Get('permissions/:module')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List permissions by module' })
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async getPermissionsByModule(@Param('module') module: string) {
    return this.rolesService.getPermissionsByModule(module);
  }

  @Patch(':roleId/permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set role permissions (OWNER only)' })
  @Roles(RoleType.OWNER)
  async setRolePermissions(
    @Param('roleId') roleId: string,
    @Body() dto: SetPermissionsDto,
  ) {
    return this.rolesService.setRolePermissions(roleId, dto.permissionIds);
  }

  // ========================================
  // Team/Members Endpoints
  // ========================================

  @Get('team')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List tenant members' })
  @Roles(RoleType.OWNER, RoleType.ADMIN, RoleType.MANAGER)
  async getTenantMembers(@GetCurrentUser() user: CurrentUser) {
    return this.rolesService.getTenantMembers(user.tenantId);
  }

  // ========================================
  // Current User Endpoints (All company users)
  // ========================================

  @Get('my-role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user role' })
  async getMyRole(@GetCurrentUser() user: CurrentUser) {
    return this.rolesService.getUserRole(user.userId, user.tenantId);
  }

  @Get('my-permissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user permissions' })
  async getMyPermissions(@GetCurrentUser() user: CurrentUser) {
    return this.rolesService.getUserPermissions(user.userId, user.tenantId);
  }

  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user role by ID' })
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async getUserRole(
    @Param('userId') userId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.rolesService.getUserRole(userId, user.tenantId);
  }

  // ========================================
  // User Role Management (OWNER/ADMIN only)
  // ========================================

  @Post('assign')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign role to user' })
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async assignRole(
    @Body() dto: AssignRoleDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.rolesService.assignRoleToUser(
      dto.userId,
      dto.role,
      user.tenantId,
      user.userId,
      dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    );
  }

  @Patch('change')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user role' })
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async changeUserRole(
    @Body() dto: ChangeRoleDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.rolesService.changeUserRole(
      dto.userId,
      dto.newRole,
      user.tenantId,
      user.userId,
    );
  }

  @Delete('remove')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove user from tenant' })
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async removeUserFromTenant(
    @Body() dto: RemoveUserDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    await this.rolesService.removeUserFromTenant(
      dto.userId,
      user.tenantId,
      user.userId,
    );
  }
}
