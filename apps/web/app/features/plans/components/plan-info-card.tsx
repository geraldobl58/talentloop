"use client";

import { memo, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
} from "@mui/material";
import { CheckCircle, Cancel, Warning } from "@mui/icons-material";

import { formatDate } from "@/app/libs/plans-data";
import { PlanInfo, PlanStatus, TenantType, isFreePlan } from "../types";
import { getPlanDisplayName } from "../config";

interface PlanInfoCardProps {
  plan: PlanInfo;
  tenantType: TenantType;
}

// Memoize status icons
const StatusIcons = {
  ACTIVE: <CheckCircle />,
  CANCELLED: <Warning />,
  EXPIRED: <Cancel />,
} as const;

const getStatusColor = (
  status: PlanStatus
): "success" | "warning" | "error" | "default" => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "CANCELLED":
      return "warning";
    case "EXPIRED":
      return "error";
    default:
      return "default";
  }
};

const getStatusIcon = (status: PlanStatus): React.ReactElement | undefined => {
  return StatusIcons[status] || undefined;
};

export const PlanInfoCard = memo(({ plan, tenantType }: PlanInfoCardProps) => {
  // Memoize computed values
  const {
    isFree,
    isPlanCancelled,
    displayName,
    priceDisplay,
    statusColor,
    statusIcon,
  } = useMemo(() => {
    const free = isFreePlan(plan.name, tenantType);
    return {
      isFree: free,
      isPlanCancelled: plan.status === "CANCELLED",
      displayName: getPlanDisplayName(plan.name, tenantType),
      priceDisplay: free
        ? "Grátis"
        : `${plan.currency} ${plan.price.toFixed(2)}/mês`,
      statusColor: getStatusColor(plan.status),
      statusIcon: getStatusIcon(plan.status),
    };
  }, [plan, tenantType]);

  // Memoize formatted dates
  const { startDate, expiryDate } = useMemo(
    () => ({
      startDate: formatDate(plan.createdAt),
      expiryDate: formatDate(plan.planExpiresAt),
    }),
    [plan.createdAt, plan.planExpiresAt]
  );

  return (
    <Card variant="outlined">
      <CardContent>
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="flex items-center gap-2">
            Plano Atual
          </Typography>
          <Chip
            label={plan.status}
            color={statusColor}
            icon={statusIcon}
            size="small"
          />
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="space-y-2">
              <Typography variant="body2" color="text.secondary">
                Nome do Plano
              </Typography>
              <Typography variant="h5" className="font-bold">
                {displayName}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="space-y-2">
              <Typography variant="body2" color="text.secondary">
                Preço
              </Typography>
              <Typography variant="h5" className="font-bold">
                {priceDisplay}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider className="my-2" />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Data de Início
            </Typography>
            <Typography variant="body1">{startDate}</Typography>
          </Grid>

          {!isFree && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" color="text.secondary">
                {isPlanCancelled ? "Acesso até" : "Próxima Cobrança"}
              </Typography>
              <Typography variant="body1">{expiryDate}</Typography>
            </Grid>
          )}

          {plan.description && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                Descrição
              </Typography>
              <Typography variant="body1">{plan.description}</Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
});

PlanInfoCard.displayName = "PlanInfoCard";
