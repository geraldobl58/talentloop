export * from "./user-types";

// Re-export plan types from plans-data
export type {
  CandidatePlanType,
  CompanyPlanType,
  PlanType,
  PlanOption,
} from "../components/plans-data";

// Tenant types from backend
export type TenantType = "CANDIDATE" | "COMPANY";

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
  domain: string; // slug do tenant
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
  tenantType?: TenantType;
  tenantId?: string;
  userId?: string;
  checkoutUrl?: string; // URL do Stripe para pagamento
  isTrial?: boolean;
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
    type: TenantType;
  };
  plan?: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  token?: string; // JWT token para login automático (trials/free)
}

/**
 * Resposta processada para o cliente
 */
export interface SignUpResponse {
  success: boolean;
  message?: string;
  tenantType?: TenantType;
  tenantSlug?: string;
  tenantId?: string;
  token?: string;
  checkoutUrl?: string;
  isTrial?: boolean;
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
