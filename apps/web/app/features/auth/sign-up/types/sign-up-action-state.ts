export type SignUpActionState = {
  success: boolean;
  message?: string;
  checkoutUrl?: string;
  isFree?: boolean;
  isTrial?: boolean;
  tenantSlug?: string;
  tenantId?: string;
  token?: string;
  errors?: Record<string, string[]> | null;
};
