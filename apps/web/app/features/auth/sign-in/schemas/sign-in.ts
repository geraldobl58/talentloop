import { z } from "zod";

import { UserType } from "../types";

// Schema base para sign-in
const baseSignInSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .min(5, "Email deve ter pelo menos 5 caracteres"),

  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha não pode exceder 100 caracteres"),

  twoFactorToken: z.string().optional(),
});

// Schema para candidato (sem tenantId obrigatório)
export const formSignInCandidateSchema = baseSignInSchema.extend({
  tenantId: z.string().optional(),
});

// Schema para empresa (com tenantId obrigatório)
export const formSignInCompanySchema = baseSignInSchema.extend({
  tenantId: z.string().min(1, "ID do Tenant é obrigatório"),
});

// Schema genérico que aceita tenantId opcional (para compatibilidade)
export const formSignInSchema = baseSignInSchema.extend({
  tenantId: z.string().optional(),
});

export type FormSignInData = z.infer<typeof formSignInSchema>;
export type FormSignInCandidateData = z.infer<typeof formSignInCandidateSchema>;
export type FormSignInCompanyData = z.infer<typeof formSignInCompanySchema>;

// Função helper para obter o schema correto baseado no tipo de usuário
export const getSignInSchema = (userType: UserType) => {
  return userType === UserType.CANDIDATE
    ? formSignInCandidateSchema
    : formSignInCompanySchema;
};
