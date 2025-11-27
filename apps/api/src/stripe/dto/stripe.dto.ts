import { IsString, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Stripe price ID for the plan' })
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @ApiProperty({ description: 'Success URL after payment' })
  @IsUrl()
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({ description: 'Cancel URL if payment is cancelled' })
  @IsUrl()
  @IsNotEmpty()
  cancelUrl: string;
}

export class CreateBillingPortalSessionDto {
  @ApiProperty({ description: 'Return URL after managing billing' })
  @IsUrl()
  @IsNotEmpty()
  returnUrl: string;
}
