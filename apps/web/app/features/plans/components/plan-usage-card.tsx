"use client";

import { memo, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Alert,
} from "@mui/material";

import { UsageStats, UsageLimits } from "../types";

interface PlanUsageCardProps {
  usage?: UsageStats | null;
  limits?: UsageLimits | null;
}

const formatLimit = (value: number | null | undefined) => {
  if (value === null || value === undefined || value === -1) return "∞";
  return value;
};

export const PlanUsageCard = memo(({ usage, limits }: PlanUsageCardProps) => {
  // Memoize computed values
  const {
    currentUsers,
    maxUsers,
    maxContacts,
    usersPercentage,
    isNearLimitUsers,
    isOverLimitUsers,
    progressColor,
  } = useMemo(() => {
    const users = usage?.currentUsers ?? 0;
    const max = usage?.maxUsers ?? 0;
    const contacts = limits?.contacts?.limit ?? 0;
    const percentage = max > 0 ? (users / max) * 100 : 0;
    const isNear = max > 0 && percentage >= 80;
    const isOver = max > 0 && users > max;

    return {
      currentUsers: users,
      maxUsers: max,
      maxContacts: contacts,
      usersPercentage: percentage,
      isNearLimitUsers: isNear,
      isOverLimitUsers: isOver,
      progressColor: isOver
        ? ("error" as const)
        : isNear
          ? ("warning" as const)
          : ("primary" as const),
    };
  }, [usage, limits]);

  // Memoize formatted limits
  const { formattedMaxUsers, formattedMaxContacts } = useMemo(
    () => ({
      formattedMaxUsers: formatLimit(maxUsers),
      formattedMaxContacts: formatLimit(maxContacts),
    }),
    [maxUsers, maxContacts]
  );

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" className="mb-4">
          Uso do Plano
        </Typography>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="space-y-2">
              <Box className="flex justify-between">
                <Typography variant="body2" color="text.secondary">
                  Usuários
                </Typography>
                <Typography variant="body2">
                  {currentUsers} / {formattedMaxUsers}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(usersPercentage, 100)}
                color={progressColor}
                sx={{ height: 8, borderRadius: 4 }}
              />
              {isOverLimitUsers && (
                <Alert severity="error" className="mt-2">
                  Você excedeu o limite de usuários do plano!
                </Alert>
              )}
              {isNearLimitUsers && !isOverLimitUsers && (
                <Alert severity="warning" className="mt-2">
                  Você está próximo do limite de usuários!
                </Alert>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="space-y-2">
              <Box className="flex justify-between">
                <Typography variant="body2" color="text.secondary">
                  Limite de Contatos
                </Typography>
                <Typography variant="body2">{formattedMaxContacts}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={0}
                color="primary"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});

PlanUsageCard.displayName = "PlanUsageCard";
