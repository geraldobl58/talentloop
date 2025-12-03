/**
 * Plan types for candidate plans
 * Based on API response structures
 */

// Plan status enum
export type PlanStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

// Plan name enum for candidates
export type CandidatePlanName = "FREE" | "PRO" | "PREMIUM";

// Plan feature interface
export interface PlanFeature {
  name: string;
  included: boolean;
  value?: string | number;
}

// Available plan from API
export interface AvailablePlan {
  id: string;
  name: CandidatePlanName;
  price: number;
  currency: string;
  stripePriceId: string | null;
  maxUsers: number | null;
  maxContacts: number | null;
  hasAPI: boolean;
  description: string | null;
  features: string[]; // Features are returned as string array from API
}

// Current plan info
export interface PlanInfo {
  id: string;
  name: CandidatePlanName;
  price: number;
  currency: string;
  maxUsers?: number;
  maxContacts?: number;
  hasAPI: boolean;
  description: string;
  planExpiresAt: string;
  createdAt: string;
  status: PlanStatus;
}

// Company/Tenant info
export interface CompanyInfo {
  id: string;
  name: string;
  tenantId: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
}

// Usage statistics (from API)
export interface UsageStats {
  currentUsers: number;
  maxUsers: number;
}

// Usage limits (from API)
export interface UsageLimits {
  contacts: {
    limit: number;
  };
  api: {
    enabled: boolean;
  };
}

// Complete tenant info response from /plans/info
export interface TenantInfoResponse {
  plan: PlanInfo;
  company: CompanyInfo;
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

// Subscription history event (from API)
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

// Subscription history summary (from API)
export interface SubscriptionHistorySummary {
  totalUpgrades: number;
  totalDowngrades: number;
  totalCancellations: number;
  daysSinceCreation: number;
  daysUntilExpiry?: number;
}

// Complete subscription history response (from API /plans/history)
export interface SubscriptionHistoryResponse {
  currentStatus: "ACTIVE" | "CANCELED" | "EXPIRED";
  currentPlan: string;
  currentPlanPrice: number;
  currentExpiresAt: string;
  startedAt: string;
  events: SubscriptionHistoryEvent[];
  summary: SubscriptionHistorySummary;
}

// Detailed history event (from API /plans/history/detailed)
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
}
