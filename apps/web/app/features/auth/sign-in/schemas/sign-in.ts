import { z } from "zod";

/**
 * Schema unificado para sign-in
 * O tipo de usuário é detectado automaticamente pelo backend
 */
export const formSignInSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido")
    .max(255, "Email não pode exceder 255 caracteres")
    .transform((email) => email.toLowerCase().trim()),

  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha não pode exceder 100 caracteres"),

  twoFactorToken: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{6}$/.test(val), {
      message: "Código 2FA deve ter 6 dígitos",
    }),
});

export type FormSignInData = z.infer<typeof formSignInSchema>;
