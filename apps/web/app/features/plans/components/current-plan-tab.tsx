"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";

import { useTenantInfo } from "../hooks";
import { TenantType } from "../types";
import { PlanInfoCard } from "./plan-info-card";
import { PlanUsageCard } from "./plan-usage-card";
import { PlanFeaturesCard } from "./plan-features-card";
import { PlanActionsCard } from "./plan-actions-card";

interface CurrentPlanTabProps {
  tenantType: TenantType;
}

// Loading component memoized
const LoadingState = memo(() => (
  <Box className="flex items-center justify-center h-64">
    <CircularProgress />
  </Box>
));
LoadingState.displayName = "LoadingState";

// Error component memoized
const ErrorState = memo(() => (
  <Alert severity="error">
    Erro ao carregar informações do plano. Tente novamente mais tarde.
  </Alert>
));
ErrorState.displayName = "ErrorState";

export const CurrentPlanTab = memo(({ tenantType }: CurrentPlanTabProps) => {
  const { data: tenantInfo, isLoading, error } = useTenantInfo();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Memoize feedback handler
  const handleFeedback = useCallback(
    (newFeedback: { type: "success" | "error"; message: string }) => {
      setFeedback(newFeedback);
    },
    []
  );

  // Memoize clear feedback
  const handleClearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  // Memoize extracted data
  const { plan, usage, limits } = useMemo(() => {
    if (!tenantInfo) {
      return { plan: null, usage: null, limits: null };
    }
    return {
      plan: tenantInfo.plan,
      usage: tenantInfo.usage,
      limits: tenantInfo.limits,
    };
  }, [tenantInfo]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !tenantInfo || !plan) {
    return <ErrorState />;
  }

  return (
    <Box className="space-y-6">
      {feedback && (
        <Alert severity={feedback.type} onClose={handleClearFeedback}>
          {feedback.message}
        </Alert>
      )}

      <PlanInfoCard plan={plan} tenantType={tenantType} />

      <PlanUsageCard usage={usage} limits={limits} />

      <PlanFeaturesCard plan={plan} />

      <PlanActionsCard
        plan={plan}
        tenantType={tenantType}
        onFeedback={handleFeedback}
      />
    </Box>
  );
});

CurrentPlanTab.displayName = "CurrentPlanTab";
