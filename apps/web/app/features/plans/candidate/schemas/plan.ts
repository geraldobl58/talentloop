import { z } from "zod";

/**
 * Schema for plan upgrade request
 * Supports upgrade via stripePriceId (Stripe) or newPlan (manual)
 */
export const planUpgradeSchema = z
  .object({
    stripePriceId: z.string().optional(),
    newPlan: z
      .enum(["FREE", "PRO", "PREMIUM"], {
        message: "Plano inválido",
      })
      .optional(),
  })
  .refine((data) => data.stripePriceId || data.newPlan, {
    message: "Especifique stripePriceId ou newPlan",
  })
  .refine((data) => !data.newPlan || data.newPlan !== "FREE", {
    message: "Não é possível fazer upgrade para o plano FREE",
  });

export type PlanUpgradeInput = z.infer<typeof planUpgradeSchema>;

/**
 * Schema for checkout session request
 * Validates Stripe price ID and URLs
 */
export const checkoutSessionSchema = z.object({
  priceId: z
    .string({ message: "ID do preço é obrigatório" })
    .min(1, { message: "ID do preço é obrigatório" }),
  successUrl: z
    .string({ message: "URL de sucesso é obrigatória" })
    .url({ message: "URL de sucesso inválida" }),
  cancelUrl: z
    .string({ message: "URL de cancelamento é obrigatória" })
    .url({ message: "URL de cancelamento inválida" }),
});

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;

/**
 * Schema for billing portal request
 * Validates return URL
 */
export const billingPortalSchema = z.object({
  returnUrl: z
    .string({ message: "URL de retorno é obrigatória" })
    .url({ message: "URL de retorno inválida" }),
});

export type BillingPortalInput = z.infer<typeof billingPortalSchema>;
