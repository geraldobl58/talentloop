import { z } from "zod";

// Regex para validar senha forte
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const formResetPasswordSchema = z
  .object({
    token: z.string().optional(),
    newPassword: z
      .string()
      .min(1, "Senha é obrigatória")
      .min(8, "A nova senha deve ter no mínimo 8 caracteres")
      .max(100, "Senha não pode exceder 100 caracteres")
      .refine((password) => passwordRegex.test(password), {
        message:
          "A senha deve conter pelo menos: 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial (@$!%*?&)",
      }),
    confirmPassword: z
      .string()
      .min(1, "Confirmação de senha é obrigatória")
      .min(8, "A confirmação de senha deve ter no mínimo 8 caracteres"),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "As senhas não coincidem",
      });
    }
  });

export type FormResetPasswordData = z.infer<typeof formResetPasswordSchema>;
