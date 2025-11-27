import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { TwoFactorService } from '../services/two-factor.service';
import { EnableTwoFactorDto } from './dto/enable-two-factor.dto';
import { VerifyTwoFactorDto } from './dto/verify-two-factor.dto';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth/2fa')
@UseGuards(AuthGuard('jwt'))
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Get('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate 2FA secret and QR code',
    description:
      'Generates a TOTP secret and QR code for setting up two-factor authentication with Google Authenticator or similar apps',
  })
  @ApiResponse({
    status: 200,
    description: 'Secret and QR code generated successfully',
    schema: {
      example: {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '2FA is already enabled for this user',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async generateSecret(@Request() req) {
    return this.twoFactorService.generateTwoFactorSecret(req.user.userId);
  }

  @Post('enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enable 2FA',
    description:
      'Activates two-factor authentication after verifying the TOTP token. Returns backup codes that should be saved securely.',
  })
  @ApiBody({ type: EnableTwoFactorDto })
  @ApiResponse({
    status: 200,
    description: '2FA enabled successfully with backup codes',
    schema: {
      example: {
        success: true,
        backupCodes: ['A1B2C3D4', 'E5F6G7H8', 'I9J0K1L2'],
        message: '2FA ativado com sucesso',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or 2FA already enabled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async enable(@Request() req, @Body() dto: EnableTwoFactorDto) {
    return this.twoFactorService.enableTwoFactor(req.user.userId, dto.token);
  }

  @Delete('disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disable 2FA',
    description:
      'Deactivates two-factor authentication after verifying the TOTP token. All backup codes will be deleted.',
  })
  @ApiBody({ type: VerifyTwoFactorDto })
  @ApiResponse({
    status: 200,
    description: '2FA disabled successfully',
    schema: {
      example: {
        success: true,
        message: '2FA desativado com sucesso',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or 2FA is not enabled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async disable(@Request() req, @Body() dto: VerifyTwoFactorDto) {
    return this.twoFactorService.disableTwoFactor(req.user.userId, dto.token);
  }

  @Post('regenerate-backup-codes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Regenerate backup codes',
    description:
      'Generates new backup codes for 2FA. Old backup codes will be invalidated. Requires TOTP token verification.',
  })
  @ApiBody({ type: VerifyTwoFactorDto })
  @ApiResponse({
    status: 200,
    description: 'Backup codes regenerated successfully',
    schema: {
      example: {
        success: true,
        backupCodes: ['M4N5O6P7', 'Q8R9S0T1', 'U2V3W4X5'],
        message: 'Backup codes regenerados com sucesso',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or 2FA is not enabled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async regenerateBackupCodes(@Request() req, @Body() dto: VerifyTwoFactorDto) {
    return this.twoFactorService.regenerateBackupCodes(
      req.user.userId,
      dto.token,
    );
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check 2FA status',
    description:
      'Returns whether two-factor authentication is enabled for the current user',
  })
  @ApiResponse({
    status: 200,
    description: '2FA status retrieved successfully',
    schema: {
      example: {
        twoFactorEnabled: true,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getStatus(@Request() req) {
    const isEnabled = await this.twoFactorService.isTwoFactorEnabled(
      req.user.userId,
    );
    return { twoFactorEnabled: isEnabled };
  }
}
