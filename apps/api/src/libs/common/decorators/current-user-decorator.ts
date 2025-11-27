import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../interfaces/request.interface';

export interface CurrentUser {
  userId: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: string;
  };
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
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
