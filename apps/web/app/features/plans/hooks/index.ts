"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";

import { APP_CONSTANTS } from "@/app/libs/constants";
import {
  getAvailablePlans,
  getTenantInfo,
  getPlanHistory,
  getPlanHistoryDetailed,
  validateSubscription,
} from "../http";
import {
  upgradePlanAction,
  cancelPlanAction,
  reactivatePlanAction,
  createCheckoutSessionAction,
  createBillingPortalAction,
  verifyCheckoutAction,
} from "../actions";
import {
  UpgradeActionState,
  PlanActionState,
  CheckoutActionState,
  VerifyCheckoutResponse,
} from "../types";

/**
 * Unified Plan React Query Hooks
 * Works for both CANDIDATE and COMPANY tenant types
 * API filters data based on tenant type from JWT token
 */

// Query keys for cache management
export const planQueryKeys = {
  all: ["plans"] as const,
  available: () => [...planQueryKeys.all, "available"] as const,
  info: () => [...planQueryKeys.all, "info"] as const,
  history: () => [...planQueryKeys.all, "history"] as const,
  historyDetailed: () => [...planQueryKeys.all, "history-detailed"] as const,
  validate: () => [...planQueryKeys.all, "validate"] as const,
};

/**
 * Hook to get available plans
 * Returns plans filtered by tenant type (from JWT)
 */
export function useAvailablePlans() {
  return useQuery({
    queryKey: planQueryKeys.available(),
    queryFn: async () => {
      const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN) as string;
      if (!token) throw new Error("Token de autenticação não encontrado");
      return getAvailablePlans(token);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get tenant subscription info
 */
export function useTenantInfo() {
  return useQuery({
    queryKey: planQueryKeys.info(),
    queryFn: async () => {
      const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN) as string;
      if (!token) throw new Error("Token de autenticação não encontrado");
      return getTenantInfo(token);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get plan history
 */
export function usePlanHistory() {
  return useQuery({
    queryKey: planQueryKeys.history(),
    queryFn: async () => {
      const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN) as string;
      if (!token) throw new Error("Token de autenticação não encontrado");
      return getPlanHistory(token);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get detailed plan history
 */
export function usePlanHistoryDetailed() {
  return useQuery({
    queryKey: planQueryKeys.historyDetailed(),
    queryFn: async () => {
      const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN) as string;
      if (!token) throw new Error("Token de autenticação não encontrado");
      return getPlanHistoryDetailed(token);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to validate subscription
 */
export function useValidateSubscription() {
  return useQuery({
    queryKey: planQueryKeys.validate(),
    queryFn: async () => {
      const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN) as string;
      if (!token) throw new Error("Token de autenticação não encontrado");
      return validateSubscription(token);
    },
    staleTime: 1 * 60 * 1000,
  });
}

// Mutation hooks options interfaces
interface UseUpgradePlanOptions {
  onSuccess?: (data: UpgradeActionState) => void;
  onError?: (error: Error) => void;
}

interface UseCancelPlanOptions {
  onSuccess?: (data: PlanActionState) => void;
  onError?: (error: Error) => void;
}

interface UseReactivatePlanOptions {
  onSuccess?: (data: UpgradeActionState) => void;
  onError?: (error: Error) => void;
}

interface UseCheckoutSessionOptions {
  onSuccess?: (data: CheckoutActionState) => void;
  onError?: (error: Error) => void;
}

interface UseBillingPortalOptions {
  onSuccess?: (data: CheckoutActionState) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to upgrade plan
 * Supports: stripePriceId (Stripe upgrade) or newPlan (manual upgrade)
 */
export function useUpgradePlan(options?: UseUpgradePlanOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { stripePriceId?: string; newPlan?: string }) => {
      const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN) as string;
      if (!token) throw new Error("Token de autenticação não encontrado");
      return upgradePlanAction(data, token);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: planQueryKeys.info() });
        queryClient.invalidateQueries({ queryKey: planQueryKeys.history() });
        queryClient.invalidateQueries({
          queryKey: planQueryKeys.historyDetailed(),
        });
      }
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to cancel plan
 */
export function useCancelPlan(options?: UseCancelPlanOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN) as string;
      if (!token) throw new Error("Token de autenticação não encontrado");
      return cancelPlanAction(token);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: planQueryKeys.info() });
        queryClient.invalidateQueries({ queryKey: planQueryKeys.history() });
        queryClient.invalidateQueries({
          queryKey: planQueryKeys.historyDetailed(),
        });
      }
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to reactivate plan
 */
export function useReactivatePlan(options?: UseReactivatePlanOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN) as string;
      if (!token) throw new Error("Token de autenticação não encontrado");
      return reactivatePlanAction(token);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: planQueryKeys.info() });
        queryClient.invalidateQueries({ queryKey: planQueryKeys.history() });
        queryClient.invalidateQueries({
          queryKey: planQueryKeys.historyDetailed(),
        });
      }
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to create checkout session
 */
export function useCheckoutSession(options?: UseCheckoutSessionOptions) {
  return useMutation({
    mutationFn: async ({
      priceId,
      successUrl,
      cancelUrl,
    }: {
      priceId: string;
      successUrl: string;
      cancelUrl: string;
    }) => {
      const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN) as string;
      if (!token) throw new Error("Token de autenticação não encontrado");
      return createCheckoutSessionAction(priceId, successUrl, cancelUrl, token);
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to create billing portal session
 */
export function useBillingPortal(options?: UseBillingPortalOptions) {
  return useMutation({
    mutationFn: async (returnUrl: string) => {
      const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN) as string;
      if (!token) throw new Error("Token de autenticação não encontrado");
      return createBillingPortalAction(returnUrl, token);
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Options for verify checkout hook
interface UseVerifyCheckoutOptions {
  onSuccess?: (data: VerifyCheckoutResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to verify checkout session and sync subscription
 * Alternative to webhooks for local development
 */
export function useVerifyCheckout(options?: UseVerifyCheckoutOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN) as string;
      if (!token) throw new Error("Token de autenticação não encontrado");
      return verifyCheckoutAction(sessionId, token);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate plan queries to refresh UI with new subscription
        queryClient.invalidateQueries({ queryKey: planQueryKeys.info() });
        queryClient.invalidateQueries({ queryKey: planQueryKeys.available() });
        queryClient.invalidateQueries({ queryKey: planQueryKeys.history() });
        queryClient.invalidateQueries({
          queryKey: planQueryKeys.historyDetailed(),
        });
      }
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
