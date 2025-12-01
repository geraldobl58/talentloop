export * from "./user-types";

// Re-export plan types from plans-data
export type {
  CandidatePlanType,
  CompanyPlanType,
  PlanType,
  PlanOption,
} from "@/app/libs/plans-data";

// Re-export TenantType from shared
export type { TenantType } from "@/app/shared/types";

// =============================================
// SIGN UP REQUEST/RESPONSE TYPES
// =============================================

/**
 * Request para cadastro de candidato
 */
export interface CandidateSignUpRequest {
  name: string;
  email: string;
  plan: "FREE" | "PRO" | "PREMIUM";
}

/**
 * Request para cadastro de empresa
 */
export interface CompanySignUpRequest {
  companyName: string;
  contactName: string;
  contactEmail: string;
  domain: string;
  plan: "STARTUP" | "BUSINESS" | "ENTERPRISE";
}

/**
 * Request genérico para cadastro (union type)
 */
export type SignUpRequest = CandidateSignUpRequest | CompanySignUpRequest;

/**
 * Resposta da API de signup
 */
export interface SignUpApiResponse {
  success: boolean;
  message?: string;
  tenantType?: "CANDIDATE" | "COMPANY";
  tenantId?: string;
  userId?: string;
  checkoutUrl?: string;
  requiresPayment?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  tenant?: {
    id: string;
    name: string;
    slug: string;
    type: "CANDIDATE" | "COMPANY";
  };
  plan?: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  token?: string;
}

/**
 * Resposta processada para o cliente
 */
export interface SignUpResponse {
  success: boolean;
  message?: string;
  tenantType?: "CANDIDATE" | "COMPANY";
  tenantSlug?: string;
  tenantId?: string;
  token?: string;
  checkoutUrl?: string;
  isFree?: boolean;
  requiresPayment?: boolean;
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
  plan?: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  errors?: Record<string, string[]>;
}
