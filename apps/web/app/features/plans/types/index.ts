/**
 * Unified Plan Types
 * Supports both CANDIDATE and COMPANY tenant types
 */

// Re-export TenantType from shared types
export type { TenantType } from "@/app/shared/types/tenant-type";
import type { TenantType } from "@/app/shared/types/tenant-type";

// Plan status enum
export type PlanStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

// Plan names by tenant type
export type CandidatePlanName = "FREE" | "PRO" | "PREMIUM";
export type CompanyPlanName = "STARTUP" | "BUSINESS" | "ENTERPRISE";
export type PlanName = CandidatePlanName | CompanyPlanName;

// Plan order for upgrade logic
export const CANDIDATE_PLAN_ORDER: Record<CandidatePlanName, number> = {
  FREE: 0,
  PRO: 1,
  PREMIUM: 2,
};

export const COMPANY_PLAN_ORDER: Record<CompanyPlanName, number> = {
  STARTUP: 1,
  BUSINESS: 2,
  ENTERPRISE: 3,
};

// Helper to get plan order by tenant type
export function getPlanOrder(planName: string, tenantType: TenantType): number {
  if (tenantType === "CANDIDATE") {
    return CANDIDATE_PLAN_ORDER[planName as CandidatePlanName] ?? 0;
  }
  return COMPANY_PLAN_ORDER[planName as CompanyPlanName] ?? 0;
}

// Helper to check if plan is free
export function isFreePlan(planName: string, tenantType: TenantType): boolean {
  // Only candidates have a FREE plan
  return tenantType === "CANDIDATE" && planName === "FREE";
}

// Available plan from API
export interface AvailablePlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  stripePriceId: string | null;
  maxUsers: number | null;
  maxContacts: number | null;
  hasAPI: boolean;
  description: string | null;
  features: string[];
  billingPeriodDays?: number;
  hasAIMatching?: boolean;
  hasRecruiterCRM?: boolean;
  hasPrioritySupport?: boolean;
}

// Current plan info
export interface PlanInfo {
  id: string;
  name: string;
  price: number;
  currency: string;
  maxUsers?: number | null;
  maxContacts?: number | null;
  hasAPI: boolean;
  description: string;
  planExpiresAt: string;
  createdAt: string;
  status: PlanStatus;
}

// Tenant/Company info
export interface TenantInfo {
  id: string;
  name: string;
  tenantId: string;
  domain?: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

// Usage statistics
export interface UsageStats {
  currentUsers: number;
  maxUsers: number;
}

// Usage limits
export interface UsageLimits {
  contacts: {
    limit: number | null;
  };
  api: {
    enabled: boolean;
  };
}

// Complete tenant info response from /plans/info
export interface TenantInfoResponse {
  plan: PlanInfo;
  company: TenantInfo;
  usage: UsageStats;
  limits: UsageLimits;
}

// Plan upgrade response
export interface PlanUpgradeResponse {
  success: boolean;
  message: string;
  newPlan: PlanInfo;
  nextBillingDate: string;
}

// Plan cancel response
export interface PlanCancelResponse {
  success: boolean;
  message: string;
}

// Subscription history event
export interface SubscriptionHistoryEvent {
  id: string;
  action: string;
  previousPlanName?: string;
  previousPlanPrice?: number;
  newPlanName?: string;
  newPlanPrice?: number;
  reason?: string;
  notes?: string;
  triggeredBy?: string;
  createdAt: string;
}

// Subscription history summary
export interface SubscriptionHistorySummary {
  totalUpgrades: number;
  totalDowngrades: number;
  totalCancellations: number;
  daysSinceCreation: number;
  daysUntilExpiry?: number;
}

// Complete subscription history response
export interface SubscriptionHistoryResponse {
  currentStatus: "ACTIVE" | "CANCELED" | "EXPIRED";
  currentPlan: string;
  currentPlanPrice: number;
  currentExpiresAt: string;
  startedAt: string;
  events: SubscriptionHistoryEvent[];
  summary: SubscriptionHistorySummary;
}

// Detailed history event
export interface PlanHistoryDetailEvent {
  id: string;
  timestamp: string;
  action: string;
  previousPlan: string | null;
  currentPlan: string | null;
  description: string;
  reason?: string;
  triggeredBy?: string;
}

// Checkout session response
export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

// Verify checkout response
export interface VerifyCheckoutResponse {
  success: boolean;
  message: string;
  plan?: string;
}

// Billing portal response
export interface BillingPortalResponse {
  url: string;
}

// Subscription validation response
export interface SubscriptionValidationResponse {
  isValid: boolean;
}

// Action state types for server actions
export interface PlanActionState {
  success: boolean;
  message?: string;
}

export interface UpgradeActionState extends PlanActionState {
  newPlan?: PlanInfo;
  nextBillingDate?: string;
}

export interface CheckoutActionState extends PlanActionState {
  url?: string;
  sessionId?: string;
}

// Plan display configuration
export interface PlanDisplayConfig {
  icon: React.ReactElement;
  color: "inherit" | "primary" | "secondary" | "success" | "warning" | "error";
  displayName: string;
  description?: string;
}
