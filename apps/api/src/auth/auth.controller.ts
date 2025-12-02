import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './services/auth.service';
import { SignupCheckoutService } from './services/signup-checkout.service';
import { SignInDto, SignInResponseDto } from './dto/signin.dto';
import {
  SignupCandidateDto,
  SignupCandidateResponseDto,
} from './dto/signup-candidate.dto';
import {
  SignupCompanyDto,
  SignupCompanyResponseDto,
} from './dto/signup-company.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/password.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/libs/common/guards/jwt-auth.guard';
import { TenantIsolationGuard } from '@/libs/common/guards/tenant-isolation.guard';
import { SkipThrottle } from '@nestjs/throttler';

import {
  CurrentUser,
  GetCurrentUser,
} from '@/libs/common/decorators/current-user-decorator';

@ApiTags('Authentication')
@Controller('auth')
@SkipThrottle() // Pular rate limiting em rotas de autenticação
export class AuthController {
  constructor(
    private service: AuthService,
    private signupCheckoutService: SignupCheckoutService,
  ) {}

  // =============================================
  // SIGNUP DE CANDIDATO (B2C)
  // =============================================

  @Post('signup/candidate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Candidate signup',
    description:
      'Creates a new candidate user in the shared candidates tenant. Password will be sent via email.',
  })
  @ApiBody({ type: SignupCandidateDto })
  @ApiResponse({
    status: 201,
    description: 'Candidate successfully created',
    type: SignupCandidateResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
  })
  @ApiResponse({
    status: 404,
    description: 'Selected plan not found',
  })
  async signupCandidate(
    @Body() body: SignupCandidateDto,
  ): Promise<SignupCandidateResponseDto> {
    return await this.signupCheckoutService.signupCandidate(body);
  }

  // =============================================
  // SIGNUP DE EMPRESA (B2B)
  // =============================================

  @Post('signup/company')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Company signup',
    description:
      'Creates a new company (tenant) with admin user and plan subscription. Password will be sent via email.',
  })
  @ApiBody({ type: SignupCompanyDto })
  @ApiResponse({
    status: 201,
    description: 'Company successfully created',
    type: SignupCompanyResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Domain already exists or email already registered',
  })
  @ApiResponse({
    status: 404,
    description: 'Selected plan not found',
  })
  async signupCompany(
    @Body() body: SignupCompanyDto,
  ): Promise<SignupCompanyResponseDto> {
    return await this.signupCheckoutService.signupCompany(body);
  }

  // =============================================
  // SIGNIN UNIFICADO (Detecção automática)
  // =============================================

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User signin',
    description:
      'Authenticates a user. The system automatically detects if the user is a candidate or company employee based on the email address.',
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'Signin successful',
    type: SignInResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async signin(@Body() dto: SignInDto): Promise<SignInResponseDto> {
    const result = await this.service.signIn(
      dto.email,
      dto.password,
      dto.twoFactorToken,
    );

    // Quando requer 2FA, tenantType ainda não está disponível
    if (result.requiresTwoFactor) {
      return {
        requiresTwoFactor: true,
        userId: result.userId,
        message: result.message,
        tenantType: 'CANDIDATE', // Placeholder, será atualizado após 2FA
      };
    }

    return {
      requiresTwoFactor: false,
      access_token: result.access_token,
      tenantType: result.tenantType as 'CANDIDATE' | 'COMPANY',
      user: result.user,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, TenantIsolationGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns the profile information of the authenticated user including role',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getProfile(@GetCurrentUser() user: CurrentUser) {
    // Buscar dados completos do usuário do banco (incluindo avatar e role)
    const fullUserData = await this.service.getUserWithRole(
      user.userId,
      user.tenantId,
    );
    const subscription = await this.service.getProfileWithPlan(user.tenantId);

    // Candidatos não usam sistema de roles - não retornar role para eles
    const isCandidate = user.tenantType === 'CANDIDATE';

    return {
      userId: fullUserData.id,
      email: fullUserData.email,
      name: fullUserData.name,
      avatar: fullUserData.avatar,
      // Role só faz sentido para empresas
      ...(isCandidate
        ? {}
        : {
            role: fullUserData.role,
            roleDescription: fullUserData.roleDescription,
          }),
      tenantId: user.tenantId,
      tenantType: user.tenantType,
      tenant: {
        id: user.tenantId,
        plan: subscription?.plan?.name || 'FREE',
        planExpiresAt: subscription?.expiresAt?.toISOString() || null,
      },
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Sends a password reset email to the user. The system automatically detects the tenant by email.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if user exists)',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.service.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with token',
    description: 'Resets user password using the token received by email',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(dto.token, dto.newPassword);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard, TenantIsolationGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password',
    description: 'Changes the password of the authenticated user',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Current password is incorrect',
  })
  async changePassword(
    @GetCurrentUser() user: CurrentUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.service.changePassword(
      user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard, TenantIsolationGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates a new access token for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
  })
  async refreshToken(@GetCurrentUser() user: CurrentUser) {
    return this.service.refreshToken(user.userId);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard, TenantIsolationGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    summary: 'Upload de avatar do usuário autenticado',
    description:
      'Uploads an avatar image for the authenticated user to Cloudinary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Imagem do avatar (JPEG, PNG, GIF, WebP - máx. 5MB)',
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar enviado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Avatar enviado com sucesso',
        },
        avatar: {
          type: 'string',
          example:
            'https://res.cloudinary.com/sass-multitenant/image/upload/v1234567890/avatars/user123.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Nenhum arquivo enviado ou formato inválido',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  async uploadAvatar(
    @GetCurrentUser() user: CurrentUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    // Validar tipo de arquivo
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de arquivo inválido. Permitidos: JPEG, PNG, GIF, WebP',
      );
    }

    // Validar tamanho (já validado pelo Multer, mas verificando novamente)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'Arquivo muito grande. Tamanho máximo: 5MB',
      );
    }

    const avatarUrl = await this.service.uploadAvatar(user.userId, file);
    return { message: 'Avatar enviado com sucesso', avatar: avatarUrl };
  }
}
