"use client";

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

const getStatusColor = (status: PlanStatus) => {
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
  switch (status) {
    case "ACTIVE":
      return <CheckCircle />;
    case "CANCELLED":
      return <Warning />;
    case "EXPIRED":
      return <Cancel />;
    default:
      return undefined;
  }
};

export const PlanInfoCard = ({ plan, tenantType }: PlanInfoCardProps) => {
  const isFree = isFreePlan(plan.name, tenantType);
  const isPlanCancelled = plan.status === "CANCELLED";
  const displayName = getPlanDisplayName(plan.name, tenantType);

  return (
    <Card variant="outlined">
      <CardContent>
        <Box className="flex items-center justify-between mb-4">
          <Typography variant="h6" className="flex items-center gap-2">
            Plano Atual
          </Typography>
          <Chip
            label={plan.status}
            color={getStatusColor(plan.status)}
            icon={getStatusIcon(plan.status)}
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
                {isFree
                  ? "Grátis"
                  : `${plan.currency} ${plan.price.toFixed(2)}/mês`}
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
            <Typography variant="body1">
              {formatDate(plan.createdAt)}
            </Typography>
          </Grid>

          {!isFree && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" color="text.secondary">
                {isPlanCancelled ? "Acesso até" : "Próxima Cobrança"}
              </Typography>
              <Typography variant="body1">
                {formatDate(plan.planExpiresAt)}
              </Typography>
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
};
