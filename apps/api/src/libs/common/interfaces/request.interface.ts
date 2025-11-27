import { Request } from 'express';
import { CurrentUser } from '../decorators/current-user-decorator';

export interface AuthenticatedRequest extends Request {
  user: CurrentUser;
}

export interface RequestWithHeaders extends Request {
  headers: {
    authorization?: string;
    [key: string]: string | undefined;
  };
}
