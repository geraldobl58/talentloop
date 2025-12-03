"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Alert,
} from "@mui/material";

import { UsageStats, UsageLimits } from "../types/plan";

interface PlanUsageCardProps {
  usage?: UsageStats | null;
  limits?: UsageLimits | null;
}

export const PlanUsageCard = ({ usage, limits }: PlanUsageCardProps) => {
  // Safe defaults from API structure
  const currentUsers = usage?.currentUsers ?? 0;
  const maxUsers = usage?.maxUsers ?? 0;
  const maxContacts = limits?.contacts?.limit ?? 0;

  // Calculate percentages
  const usersPercentage = maxUsers > 0 ? (currentUsers / maxUsers) * 100 : 0;
  const isNearLimitUsers = maxUsers > 0 && usersPercentage >= 80;
  const isOverLimitUsers = maxUsers > 0 && currentUsers > maxUsers;

  const formatLimit = (value: number | null | undefined) => {
    if (value === null || value === undefined || value === -1) return "∞";
    return value;
  };

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
                  {currentUsers} / {formatLimit(maxUsers)}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(usersPercentage, 100)}
                color={
                  isOverLimitUsers
                    ? "error"
                    : isNearLimitUsers
                      ? "warning"
                      : "primary"
                }
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
                <Typography variant="body2">
                  {formatLimit(maxContacts)}
                </Typography>
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
};
