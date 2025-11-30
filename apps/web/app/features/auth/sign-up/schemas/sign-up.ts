import { z } from "zod";

import { UserType } from "../types/user-types";

// =============================================
// SCHEMAS PARA CANDIDATOS
// =============================================

export const candidatePlanSchema = z.enum(["FREE", "PRO", "PREMIUM"]);

export const formSignUpCandidateSchema = z.object({
  // Campos do candidato
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome não pode exceder 100 caracteres"),

  email: z
    .string()
    .email("Email inválido")
    .min(5, "Email deve ter pelo menos 5 caracteres"),
});

// =============================================
// SCHEMAS PARA EMPRESAS
// =============================================

export const companyPlanSchema = z.enum(["STARTUP", "BUSINESS", "ENTERPRISE"]);

export const formSignUpCompanySchema = z.object({
  // Campos da empresa
  companyName: z
    .string()
    .min(2, "Nome da empresa deve ter pelo menos 2 caracteres")
    .max(100, "Nome da empresa não pode exceder 100 caracteres"),

  domain: z
    .string()
    .min(3, "Domínio deve ter pelo menos 3 caracteres")
    .max(50, "Domínio não pode exceder 50 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "Domínio pode conter apenas letras minúsculas, números e hífens"
    ),

  contactName: z
    .string()
    .min(2, "Nome do contato deve ter pelo menos 2 caracteres")
    .max(100, "Nome do contato não pode exceder 100 caracteres"),

  contactEmail: z
    .string()
    .email("Email inválido")
    .min(5, "Email deve ter pelo menos 5 caracteres"),
});

// =============================================
// TIPOS INFERIDOS
// =============================================

export type FormSignUpCandidateData = z.infer<typeof formSignUpCandidateSchema>;
export type FormSignUpCompanyData = z.infer<typeof formSignUpCompanySchema>;

// Union type para uso genérico
export type FormSignUpData = FormSignUpCandidateData | FormSignUpCompanyData;

// =============================================
// HELPERS
// =============================================

/**
 * Retorna o schema correto baseado no tipo de usuário
 */
export const getSignUpSchema = (userType: UserType) => {
  return userType === UserType.CANDIDATE
    ? formSignUpCandidateSchema
    : formSignUpCompanySchema;
};

/**
 * Type guard para verificar se é dados de candidato
 */
export const isCandidateData = (
  data: FormSignUpData
): data is FormSignUpCandidateData => {
  return "name" in data && !("companyName" in data);
};

/**
 * Type guard para verificar se é dados de empresa
 */
export const isCompanyData = (
  data: FormSignUpData
): data is FormSignUpCompanyData => {
  return "companyName" in data && "domain" in data;
};
