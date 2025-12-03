import { z } from "zod";

/**
 * Schema for generating 2FA secret
 * No input needed, just needs authentication
 */
export const generate2FASchema = z.object({});

export type Generate2FAInput = z.infer<typeof generate2FASchema>;

/**
 * Schema for enabling 2FA
 * Validates the TOTP token (exactly 6 digits - numbers only)
 */
export const enable2FASchema = z.object({
  token: z
    .string({ message: "Código é obrigatório" })
    .length(6, { message: "Código deve ter exatamente 6 dígitos" })
    .regex(/^\d{6}$/, { message: "Código deve conter apenas números" }),
});

export type Enable2FAInput = z.infer<typeof enable2FASchema>;

/**
 * Schema for disabling 2FA
 * Validates the TOTP token (6 digits) OR backup code (8 alphanumeric characters)
 * - TOTP: 6 digits (numbers only)
 * - Backup code: 8 alphanumeric characters (letters and numbers)
 */
export const disable2FASchema = z.object({
  token: z
    .string({ message: "Código é obrigatório" })
    .min(6, { message: "Código deve ter no mínimo 6 caracteres" })
    .max(8, { message: "Código deve ter no máximo 8 caracteres" })
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "Código deve conter apenas letras e números",
    }),
});

export type Disable2FAInput = z.infer<typeof disable2FASchema>;
