import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlanUpgradeDto } from './dto/plan-upgrade.dto';
import {
  PlanUpgradeResponseDto,
  PlanCancelResponseDto,
} from './dto/plan-response.dto';
import {
  SubscriptionHistoryDto,
  PlanHistoryDetailDto,
} from './dto/subscription-history.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../libs/common/guards/jwt-auth.guard';
import { TenantIsolationGuard } from '../libs/common/guards/tenant-isolation.guard';
import {
  GetCurrentUser,
  CurrentUser,
} from '../libs/common/decorators/current-user-decorator';

@ApiTags('Plans')
@Controller('plans')
@UseGuards(JwtAuthGuard, TenantIsolationGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get('available')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all available plans',
    description:
      'Returns all available subscription plans for the current user type (candidate or company)',
  })
  @ApiResponse({
    status: 200,
    description: 'Available plans retrieved successfully',
  })
  async getAvailablePlans(@GetCurrentUser() user: CurrentUser) {
    return await this.plansService.getAllPlans(user.tenantType);
  }

  @Get('info')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get complete tenant subscription information',
    description:
      'Returns consolidated information: current plan, company details, usage statistics, and limits',
  })
  @ApiResponse({
    status: 200,
    description: 'Information retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getTenantInfo(@GetCurrentUser() user: CurrentUser) {
    const [plan, company, usage, limits] = await Promise.all([
      this.plansService.getCurrentPlan(user.tenantId),
      this.plansService.getCurrentCompany(user.tenantId),
      this.plansService.getPlanUsage(user.tenantId),
      this.plansService.checkUsageLimits(user.tenantId),
    ]);

    return {
      plan,
      company,
      usage,
      limits,
    };
  }

  @Post('upgrade')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upgrade plan',
    description: 'Upgrades the current plan to a higher tier',
  })
  @ApiBody({ type: PlanUpgradeDto })
  @ApiResponse({
    status: 200,
    description: 'Plan upgraded successfully',
    type: PlanUpgradeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid upgrade request',
    schema: {
      example: {
        statusCode: 400,
        message: 'O novo plano deve ser superior ao plano atual',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Plan not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Plano não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  upgradePlan(
    @GetCurrentUser() user: CurrentUser,
    @Body() dto: PlanUpgradeDto,
  ): Promise<PlanUpgradeResponseDto> {
    return this.plansService.upgradePlan(user.tenantId, dto);
  }

  @Post('cancel')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel plan',
    description: 'Cancels the current plan subscription',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan canceled successfully',
    type: PlanCancelResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Plan not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Assinatura não encontrada',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  cancelPlan(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<PlanCancelResponseDto> {
    return this.plansService.cancelPlan(user.tenantId);
  }

  @Post('reactivate')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reactivate plan',
    description: 'Reactivates a previously cancelled plan subscription',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan reactivated successfully',
    type: PlanUpgradeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Plan cannot be reactivated',
    schema: {
      example: {
        statusCode: 400,
        message: 'Apenas assinaturas canceladas podem ser reativadas',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Plan not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Assinatura não encontrada',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  reactivatePlan(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<PlanUpgradeResponseDto> {
    return this.plansService.reactivateSubscription(user.tenantId);
  }

  @Get('history')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get plan history with summary',
    description:
      'Returns the complete plan history for the authenticated user with summary statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Plan history retrieved successfully',
    type: SubscriptionHistoryDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  getPlanHistory(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<SubscriptionHistoryDto> {
    return this.plansService.getPlanHistory(user.tenantId);
  }

  @Get('history/detailed')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get detailed plan history timeline',
    description:
      'Returns plan history in timeline format with descriptions for each event',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed plan history retrieved successfully',
    type: [PlanHistoryDetailDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  getPlanHistoryDetailed(
    @GetCurrentUser() user: CurrentUser,
  ): Promise<PlanHistoryDetailDto[]> {
    return this.plansService.getPlanHistoryDetailed(user.tenantId);
  }

  @Post('checkout-session')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create checkout session',
    description: 'Creates a Stripe checkout session for plan subscription',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        priceId: { type: 'string', description: 'Stripe price ID' },
        successUrl: { type: 'string', description: 'Success redirect URL' },
        cancelUrl: { type: 'string', description: 'Cancel redirect URL' },
      },
      required: ['priceId', 'successUrl', 'cancelUrl'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully',
  })
  async createCheckoutSession(
    @Body() dto: { priceId: string; successUrl: string; cancelUrl: string },
    @GetCurrentUser() user: CurrentUser,
  ) {
    const sessionUrl = await this.plansService.createCheckoutSession(
      user.tenantId,
      dto.priceId,
      dto.successUrl,
      dto.cancelUrl,
    );
    return { url: sessionUrl };
  }

  @Post('billing-portal')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create billing portal session',
    description:
      'Creates a Stripe billing portal session for subscription management',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        returnUrl: {
          type: 'string',
          description: 'Return URL after billing management',
        },
      },
      required: ['returnUrl'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Billing portal session created successfully',
  })
  async createBillingPortalSession(
    @Body() dto: { returnUrl: string },
    @GetCurrentUser() user: CurrentUser,
  ) {
    const portalUrl = await this.plansService.createBillingPortalSession(
      user.tenantId,
      dto.returnUrl,
    );
    return { url: portalUrl };
  }

  @Get('subscription/validate')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Validate subscription',
    description: 'Validates if the current subscription is active and valid',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription validation result',
  })
  async validateSubscription(@GetCurrentUser() user: CurrentUser) {
    const isValid = await this.plansService.validateSubscription(user.tenantId);
    return { isValid };
  }
}
