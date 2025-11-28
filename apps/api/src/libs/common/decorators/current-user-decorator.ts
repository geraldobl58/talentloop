import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/request.interface';
import { TenantType } from '@prisma/client';

export interface CurrentUser {
  userId: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: string;
  };
  tenantId: string;
  tenantType: TenantType; // CANDIDATE or COMPANY
  tenant: {
    id: string;
    name: string;
    slug: string;
    type: TenantType;
  };
}

export const GetCurrentUser = createParamDecorator(
  (data: keyof CurrentUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (data) {
      return user?.[data];
    }
    return user;
  },
);
