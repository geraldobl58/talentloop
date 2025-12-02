import { TenantType } from "./user-type";

export type SignInActionState = {
  success: boolean;
  message?: string;
  token?: string;
  requiresTwoFactor?: boolean;
  tenantType?: TenantType;
  userId?: string;
  errors?: Record<string, string[]> | null;
};
