"use server";

import { HTTPError } from "ky";

import {
  planUpgradeSchema,
  checkoutSessionSchema,
  billingPortalSchema,
} from "../schemas/plan";
import {
  upgradePlan,
  cancelPlan,
  reactivatePlan,
  createCheckoutSession,
  createBillingPortalSession,
} from "../http/plan-candidate";
import {
  PlanActionState,
  UpgradeActionState,
  CheckoutActionState,
} from "../types/plan";

/**
 * Helper to handle HTTP errors
 */
async function handleHttpError(error: HTTPError): Promise<string> {
  try {
    const errorData = (await error.response.json()) as { message?: string };
    return errorData.message || "Erro ao processar requisição";
  } catch {
    return "Erro ao processar resposta do servidor";
  }
}

/**
 * Server Action to upgrade plan
 * Supports: stripePriceId (Stripe upgrade) or newPlan (manual upgrade)
 */
export async function upgradePlanAction(
  data: { stripePriceId?: string; newPlan?: string },
  token: string
): Promise<UpgradeActionState> {
  try {
    const validatedData = planUpgradeSchema.parse(data);

    const response = await upgradePlan(token, validatedData);

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Falha ao atualizar plano",
      };
    }

    return {
      success: true,
      message: response.message,
      newPlan: response.newPlan,
      nextBillingDate: response.nextBillingDate,
    };
  } catch (error) {
    console.error("[UpgradePlan Action Error]", error);

    if (error instanceof Error && "errors" in error) {
      const validationError = error as { errors?: Array<{ message: string }> };
      return {
        success: false,
        message: validationError.errors?.[0]?.message || "Dados inválidos",
      };
    }

    if (error instanceof HTTPError) {
      return {
        success: false,
        message: await handleHttpError(error),
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao atualizar plano",
    };
  }
}

/**
 * Server Action to cancel plan
 */
export async function cancelPlanAction(
  token: string
): Promise<PlanActionState> {
  try {
    const response = await cancelPlan(token);

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Falha ao cancelar plano",
      };
    }

    return {
      success: true,
      message: response.message,
    };
  } catch (error) {
    console.error("[CancelPlan Action Error]", error);

    if (error instanceof HTTPError) {
      return {
        success: false,
        message: await handleHttpError(error),
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao cancelar plano",
    };
  }
}

/**
 * Server Action to reactivate plan
 */
export async function reactivatePlanAction(
  token: string
): Promise<UpgradeActionState> {
  try {
    const response = await reactivatePlan(token);

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Falha ao reativar plano",
      };
    }

    return {
      success: true,
      message: response.message,
      newPlan: response.newPlan,
      nextBillingDate: response.nextBillingDate,
    };
  } catch (error) {
    console.error("[ReactivatePlan Action Error]", error);

    if (error instanceof HTTPError) {
      return {
        success: false,
        message: await handleHttpError(error),
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao reativar plano",
    };
  }
}

/**
 * Server Action to create checkout session
 */
export async function createCheckoutSessionAction(
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  token: string
): Promise<CheckoutActionState> {
  try {
    const validatedData = checkoutSessionSchema.parse({
      priceId,
      successUrl,
      cancelUrl,
    });

    const response = await createCheckoutSession(
      token,
      validatedData.priceId,
      validatedData.successUrl,
      validatedData.cancelUrl
    );

    return {
      success: true,
      url: response.url,
    };
  } catch (error) {
    console.error("[CreateCheckoutSession Action Error]", error);

    if (error instanceof Error && "errors" in error) {
      const validationError = error as { errors?: Array<{ message: string }> };
      return {
        success: false,
        message: validationError.errors?.[0]?.message || "Dados inválidos",
      };
    }

    if (error instanceof HTTPError) {
      return {
        success: false,
        message: await handleHttpError(error),
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao criar sessão de checkout",
    };
  }
}

/**
 * Server Action to create billing portal session
 */
export async function createBillingPortalAction(
  returnUrl: string,
  token: string
): Promise<CheckoutActionState> {
  try {
    const validatedData = billingPortalSchema.parse({ returnUrl });

    const response = await createBillingPortalSession(
      token,
      validatedData.returnUrl
    );

    return {
      success: true,
      url: response.url,
    };
  } catch (error) {
    console.error("[CreateBillingPortal Action Error]", error);

    if (error instanceof Error && "errors" in error) {
      const validationError = error as { errors?: Array<{ message: string }> };
      return {
        success: false,
        message: validationError.errors?.[0]?.message || "Dados inválidos",
      };
    }

    if (error instanceof HTTPError) {
      return {
        success: false,
        message: await handleHttpError(error),
      };
    }

    return {
      success: false,
      message: "Erro inesperado ao criar portal de cobrança",
    };
  }
}
