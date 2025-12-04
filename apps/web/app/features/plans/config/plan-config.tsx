import { Star, Rocket, WorkspacePremium, Business } from "@mui/icons-material";
import { TenantType, PlanDisplayConfig } from "../types";

/**
 * Plan Configuration
 * Display settings and helpers for both CANDIDATE and COMPANY plans
 */

// Candidate plan display config
export const CANDIDATE_PLAN_CONFIG: Record<string, PlanDisplayConfig> = {
  FREE: {
    icon: <Star />,
    color: "inherit",
    displayName: "Free",
    description: "Para começar",
  },
  PRO: {
    icon: <Rocket />,
    color: "primary",
    displayName: "Pro",
    description: "Para profissionais",
  },
  PREMIUM: {
    icon: <WorkspacePremium />,
    color: "secondary",
    displayName: "Premium",
    description: "Acesso completo",
  },
};

// Company plan display config
export const COMPANY_PLAN_CONFIG: Record<string, PlanDisplayConfig> = {
  STARTUP: {
    icon: <Rocket />,
    color: "primary",
    displayName: "Startup",
    description: "Ideal para pequenas empresas",
  },
  BUSINESS: {
    icon: <Business />,
    color: "secondary",
    displayName: "Business",
    description: "Para empresas em crescimento",
  },
  ENTERPRISE: {
    icon: <WorkspacePremium />,
    color: "success",
    displayName: "Enterprise",
    description: "Solução completa para grandes empresas",
  },
};

/**
 * Get plan display configuration by tenant type
 */
export function getPlanConfig(
  planName: string,
  tenantType: TenantType
): PlanDisplayConfig {
  const config =
    tenantType === "CANDIDATE"
      ? CANDIDATE_PLAN_CONFIG[planName]
      : COMPANY_PLAN_CONFIG[planName];

  // Default fallback
  return (
    config || {
      icon: <Star />,
      color: "inherit",
      displayName: planName,
      description: "",
    }
  );
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(
  planName: string,
  tenantType: TenantType
): string {
  return getPlanConfig(planName, tenantType).displayName;
}

/**
 * Get plan icon
 */
export function getPlanIcon(
  planName: string,
  tenantType: TenantType
): React.ReactElement {
  return getPlanConfig(planName, tenantType).icon;
}

/**
 * Get plan color
 */
export function getPlanColor(
  planName: string,
  tenantType: TenantType
): PlanDisplayConfig["color"] {
  return getPlanConfig(planName, tenantType).color;
}

/**
 * Format price for display
 */
export function formatPlanPrice(price: number, currency: string): string {
  if (price === 0) return "Grátis";
  return `${currency} ${price.toFixed(2)}/mês`;
}

/**
 * Get plans URL path - unified for all tenant types
 */
export function getPlansPath(_tenantType: TenantType): string {
  return "/my-plans";
}
