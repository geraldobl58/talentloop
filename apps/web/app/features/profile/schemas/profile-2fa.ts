import { z } from "zod";

/**
 * Schema for generating 2FA secret
 * No input needed, just needs authentication
 */
export const generate2FASchema = z.object({});

export type Generate2FAInput = z.infer<typeof generate2FASchema>;

/**
 * Schema for enabling 2FA
 * Validates the TOTP token (exactly 6 digits)
 */
export const enable2FASchema = z.object({
  token: z
    .string({ message: "Código é obrigatório" })
    .length(6, { message: "Código deve ter exatamente 6 dígitos" })
    .regex(/^\d{6}$/, { message: "Código deve conter apenas dígitos" }),
});

export type Enable2FAInput = z.infer<typeof enable2FASchema>;

/**
 * Schema for disabling 2FA
 * Validates the TOTP token (6-8 characters for TOTP or backup code)
 */
export const disable2FASchema = z.object({
  token: z
    .string({ message: "Código é obrigatório" })
    .min(6, { message: "Código deve ter no mínimo 6 caracteres" })
    .max(8, { message: "Código deve ter no máximo 8 caracteres" }),
});

export type Disable2FAInput = z.infer<typeof disable2FASchema>;
