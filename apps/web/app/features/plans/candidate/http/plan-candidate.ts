import ky from "ky";

import { env } from "@/app/libs/env";
import {
  AvailablePlan,
  TenantInfoResponse,
  PlanUpgradeResponse,
  PlanCancelResponse,
  SubscriptionHistoryResponse,
  PlanHistoryDetailEvent,
  CheckoutSessionResponse,
  BillingPortalResponse,
  SubscriptionValidationResponse,
} from "../types/plan";

/**
 * Creates an authenticated API instance
 */
const createAuthApi = (token: string) =>
  ky.create({
    prefixUrl: env.NEXT_PUBLIC_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

/**
 * Get all available plans for candidates
 */
export async function getAvailablePlans(
  token: string
): Promise<AvailablePlan[]> {
  const api = createAuthApi(token);
  return api.get("plans/available").json<AvailablePlan[]>();
}

/**
 * Get complete tenant subscription information
 * Returns: plan, company, usage, limits
 */
export async function getTenantInfo(
  token: string
): Promise<TenantInfoResponse> {
  const api = createAuthApi(token);
  return api.get("plans/info").json<TenantInfoResponse>();
}

/**
 * Upgrade plan to a higher tier
 * Supports: stripePriceId (Stripe upgrade) or newPlan (manual upgrade)
 */
export async function upgradePlan(
  token: string,
  data: { stripePriceId?: string; newPlan?: string }
): Promise<PlanUpgradeResponse> {
  const api = createAuthApi(token);
  return api
    .post("plans/upgrade", {
      json: data,
    })
    .json<PlanUpgradeResponse>();
}

/**
 * Cancel current plan subscription
 */
export async function cancelPlan(token: string): Promise<PlanCancelResponse> {
  const api = createAuthApi(token);
  return api.post("plans/cancel").json<PlanCancelResponse>();
}

/**
 * Reactivate a previously cancelled subscription
 */
export async function reactivatePlan(
  token: string
): Promise<PlanUpgradeResponse> {
  const api = createAuthApi(token);
  return api.post("plans/reactivate").json<PlanUpgradeResponse>();
}

/**
 * Get plan history with summary statistics
 */
export async function getPlanHistory(
  token: string
): Promise<SubscriptionHistoryResponse> {
  const api = createAuthApi(token);
  return api.get("plans/history").json<SubscriptionHistoryResponse>();
}

/**
 * Get detailed plan history timeline
 */
export async function getPlanHistoryDetailed(
  token: string
): Promise<PlanHistoryDetailEvent[]> {
  const api = createAuthApi(token);
  return api.get("plans/history/detailed").json<PlanHistoryDetailEvent[]>();
}

/**
 * Create Stripe checkout session for plan subscription
 */
export async function createCheckoutSession(
  token: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSessionResponse> {
  const api = createAuthApi(token);
  return api
    .post("plans/checkout-session", {
      json: { priceId, successUrl, cancelUrl },
    })
    .json<CheckoutSessionResponse>();
}

/**
 * Create Stripe billing portal session for subscription management
 */
export async function createBillingPortalSession(
  token: string,
  returnUrl: string
): Promise<BillingPortalResponse> {
  const api = createAuthApi(token);
  return api
    .post("plans/billing-portal", {
      json: { returnUrl },
    })
    .json<BillingPortalResponse>();
}

/**
 * Validate if current subscription is active
 */
export async function validateSubscription(
  token: string
): Promise<SubscriptionValidationResponse> {
  const api = createAuthApi(token);
  return api
    .get("plans/subscription/validate")
    .json<SubscriptionValidationResponse>();
}
