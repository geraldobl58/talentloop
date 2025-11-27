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

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // ========================================
  // Role Endpoints
  // ========================================

  @Get()
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get('permissions')
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async getAllPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @Get('permissions/:module')
  @Roles(RoleType.OWNER, RoleType.ADMIN)
  async getPermissionsByModule(@Param('module') module: string) {
    return this.rolesService.getPermissionsByModule(module);
  }

  @Patch(':roleId/permissions')
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
  @Roles(RoleType.OWNER, RoleType.ADMIN, RoleType.MANAGER)
  async getTenantMembers(@GetCurrentUser() user: CurrentUser) {
    return this.rolesService.getTenantMembers(user.tenantId);
  }

  @Get('my-role')
  async getMyRole(@GetCurrentUser() user: CurrentUser) {
    return this.rolesService.getUserRole(user.userId, user.tenantId);
  }

  @Get('my-permissions')
  async getMyPermissions(@GetCurrentUser() user: CurrentUser) {
    return this.rolesService.getUserPermissions(user.userId, user.tenantId);
  }

  @Get('user/:userId')
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
