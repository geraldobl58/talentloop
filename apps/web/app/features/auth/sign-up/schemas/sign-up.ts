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
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome não pode exceder 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços")
    .transform((name) => name.trim()),

  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido")
    .max(255, "Email não pode exceder 255 caracteres")
    .transform((email) => email.toLowerCase().trim()),
});

// =============================================
// SCHEMAS PARA EMPRESAS
// =============================================

export const companyPlanSchema = z.enum(["STARTUP", "BUSINESS", "ENTERPRISE"]);

export const formSignUpCompanySchema = z.object({
  // Campos da empresa
  companyName: z
    .string()
    .min(1, "Nome da empresa é obrigatório")
    .min(2, "Nome da empresa deve ter pelo menos 2 caracteres")
    .max(100, "Nome da empresa não pode exceder 100 caracteres")
    .transform((name) => name.trim()),

  domain: z
    .string()
    .min(1, "Domínio é obrigatório")
    .min(3, "Domínio deve ter pelo menos 3 caracteres")
    .max(50, "Domínio não pode exceder 50 caracteres")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Domínio pode conter apenas letras minúsculas, números e hífens (não pode começar ou terminar com hífen)"
    )
    .transform((domain) => domain.toLowerCase().trim()),

  contactName: z
    .string()
    .min(1, "Nome do contato é obrigatório")
    .min(2, "Nome do contato deve ter pelo menos 2 caracteres")
    .max(100, "Nome do contato não pode exceder 100 caracteres")
    .regex(
      /^[a-zA-ZÀ-ÿ\s]+$/,
      "Nome do contato deve conter apenas letras e espaços"
    )
    .transform((name) => name.trim()),

  contactEmail: z
    .string()
    .min(1, "Email do contato é obrigatório")
    .email("Email inválido")
    .max(255, "Email não pode exceder 255 caracteres")
    .transform((email) => email.toLowerCase().trim()),
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

export const signUpCandidateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().min(5),
  plan: candidatePlanSchema,
});

export const signUpCompanySchema = z.object({
  companyName: z.string().min(2).max(100),
  domain: z.string().min(3).max(50),
  contactName: z.string().min(2).max(100),
  contactEmail: z.string().email().min(5),
  plan: companyPlanSchema,
});
