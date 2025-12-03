import { z } from "zod";

/**
 * Schema for change password request
 * Validates current and new passwords
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ message: "Senha atual é obrigatória" })
      .min(1, { message: "Senha atual é obrigatória" }),
    newPassword: z
      .string({ message: "Nova senha é obrigatória" })
      .min(8, { message: "Nova senha deve ter no mínimo 8 caracteres" })
      .regex(/[A-Z]/, {
        message: "Nova senha deve conter pelo menos uma letra maiúscula",
      })
      .regex(/[0-9]/, {
        message: "Nova senha deve conter pelo menos um número",
      })
      .regex(/[^A-Za-z0-9]/, {
        message: "Nova senha deve conter pelo menos um caractere especial",
      }),
    confirmPassword: z
      .string({ message: "Confirmação de senha é obrigatória" })
      .min(1, { message: "Confirmação de senha é obrigatória" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
