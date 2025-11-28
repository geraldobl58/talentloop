export * from "./user-type";

// Tenant types from backend
export type TenantType = "CANDIDATE" | "COMPANY";

export interface SignInRequest {
  email: string;
  password: string;
  tenantId: string;
  twoFactorToken?: string;
}

/**
 * Resposta bruta da API de signin
 */
export interface SignInApiResponse {
  access_token?: string;
  requiresTwoFactor: boolean;
  tenantType?: TenantType; // Type returned from API
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
}

/**
 * Resposta processada para o cliente
 */
export interface SignInResponse {
  success: boolean;
  message?: string;
  token?: string;
  requiresTwoFactor: boolean;
  tenantType?: TenantType; // Type for dashboard routing
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}
