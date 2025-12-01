import { z } from "zod";

/**
 * Schema unificado para sign-in
 * O tipo de usuário é detectado automaticamente pelo backend
 */
export const formSignInSchema = z.object({
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

export type FormSignInData = z.infer<typeof formSignInSchema>;
