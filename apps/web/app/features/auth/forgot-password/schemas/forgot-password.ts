import { z } from "zod";

/**
 * Schema unificado para forgot password
 * O tipo de usuário é detectado automaticamente pelo backend
 */
export const formForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .trim()
    .toLowerCase()
    .email("Email inválido")
    .max(255, "Email não pode exceder 255 caracteres"),
});

export type FormForgotPasswordData = z.infer<typeof formForgotPasswordSchema>;
