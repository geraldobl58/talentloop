"use client";

import { useState } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";

import { useTenantInfo } from "../hooks/use-plan-candidate";
import { PlanInfoCard } from "./plan-info-card";
import { PlanUsageCard } from "./plan-usage-card";
import { PlanFeaturesCard } from "./plan-features-card";
import { PlanActionsCard } from "./plan-actions-card";

export const CurrentPlanTab = () => {
  const { data: tenantInfo, isLoading, error } = useTenantInfo();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !tenantInfo || !tenantInfo.plan) {
    return (
      <Alert severity="error">
        Erro ao carregar informações do plano. Tente novamente mais tarde.
      </Alert>
    );
  }

  const { plan, usage, limits } = tenantInfo;

  return (
    <Box className="space-y-6">
      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <PlanInfoCard plan={plan} />

      <PlanUsageCard usage={usage} limits={limits} />

      <PlanFeaturesCard plan={plan} />

      <PlanActionsCard plan={plan} onFeedback={setFeedback} />
    </Box>
  );
};
