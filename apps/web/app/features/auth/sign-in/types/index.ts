export * from "./user-type";

// Re-export TenantType from shared
export type { TenantType } from "@/app/shared/types";

/**
 * Request para signin unificado (tipo detectado automaticamente pelo backend)
 */
export interface SignInRequest {
  email: string;
  password: string;
  twoFactorToken?: string;
}

/**
 * Resposta bruta da API de signin
 */
export interface SignInApiResponse {
  access_token?: string;
  requiresTwoFactor: boolean;
  tenantType?: "CANDIDATE" | "COMPANY";
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
  tenantType?: "CANDIDATE" | "COMPANY";
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}
