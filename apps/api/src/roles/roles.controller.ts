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
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('roles')
@UseGuards(JwtAuthGuard, TenantIsolationGuard, RolesGuard)
@CompaniesOnly() // Roles management só faz sentido para empresas
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // ========================================
  // Role Endpoints
  // ========================================

  @Get()
  @ApiBearerAuth()
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get('permissions')
  @ApiBearerAuth()
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async getAllPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @Get('permissions/:module')
  @ApiBearerAuth()
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async getPermissionsByModule(@Param('module') module: string) {
    return this.rolesService.getPermissionsByModule(module);
  }

  @Patch(':roleId/permissions')
  @ApiBearerAuth()
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
  @Roles(RoleType.OWNER, RoleType.ADMIN, RoleType.MANAGER)
  async getTenantMembers(@GetCurrentUser() user: CurrentUser) {
    return this.rolesService.getTenantMembers(user.tenantId);
  }

  @Get('my-role')
  @ApiBearerAuth()
  async getMyRole(@GetCurrentUser() user: CurrentUser) {
    return this.rolesService.getUserRole(user.userId, user.tenantId);
  }

  @Get('my-permissions')
  @ApiBearerAuth()
  async getMyPermissions(@GetCurrentUser() user: CurrentUser) {
    return this.rolesService.getUserPermissions(user.userId, user.tenantId);
  }

  @Get('user/:userId')
  @ApiBearerAuth()
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async getUserRole(
    @Param('userId') userId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.rolesService.getUserRole(userId, user.tenantId);
  }

  // ========================================
  // User Role Management
  // ========================================

  @Post('assign')
  @ApiBearerAuth()
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
