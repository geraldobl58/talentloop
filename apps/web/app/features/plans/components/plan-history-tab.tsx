"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";

import { usePlanHistory, usePlanHistoryDetailed } from "../hooks";

import { ACTION_CONFIG } from "@/app/constants/action-config";

import { formatDate } from "@/app/libs/plans-data";

export const PlanHistoryTab = () => {
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    error: historyError,
  } = usePlanHistory();
  const { data: detailedHistory, isLoading: isLoadingDetailed } =
    usePlanHistoryDetailed();

  const isLoading = isLoadingHistory || isLoadingDetailed;

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (historyError || !historyData) {
    return (
      <Alert severity="info">
        Nenhum histórico de alterações encontrado para este plano.
      </Alert>
    );
  }

  const {
    currentStatus,
    currentPlan,
    currentPlanPrice,
    currentExpiresAt,
    startedAt,
    events,
    summary,
  } = historyData;

  const hasHistory = events && events.length > 0;

  return (
    <Box className="space-y-6">
      {/* Current Plan Status */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            Status Atual
          </Typography>
          <Grid container spacing={2} mt={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Plano atual
              </Typography>
              <Typography variant="h6">
                <strong>{currentPlan}</strong>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={currentStatus}
                color={
                  currentStatus === "ACTIVE"
                    ? "success"
                    : currentStatus === "CANCELED"
                      ? "warning"
                      : "error"
                }
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Preço
              </Typography>
              <Typography variant="body1">
                {currentPlanPrice === 0
                  ? "Grátis"
                  : `R$ ${currentPlanPrice.toFixed(2)}/mês`}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Expira em
              </Typography>
              <Typography variant="body1">
                {formatDate(currentExpiresAt)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Resumo
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Box className="text-center">
                <Typography variant="h4" color="success.main">
                  {summary?.totalUpgrades ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upgrades
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Box className="text-center">
                <Typography variant="h4" color="warning.main">
                  {summary?.totalDowngrades ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Downgrades
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Box className="text-center">
                <Typography variant="h4" color="error.main">
                  {summary?.totalCancellations ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cancelamentos
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <Box className="text-center">
                <Typography variant="h4" color="primary">
                  {summary?.daysSinceCreation ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dias desde criação
                </Typography>
              </Box>
            </Grid>

            {summary?.daysUntilExpiry !== undefined && (
              <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                <Box className="text-center">
                  <Typography variant="h4" color="info.main">
                    {summary.daysUntilExpiry}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dias até expirar
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>

          <Box className="my-4 mt-4">
            <Divider />
          </Box>

          <Grid container spacing={2} mt={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="body2" color="text.secondary">
                Assinatura iniciada em: <strong>{formatDate(startedAt)}</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Linha do Tempo
          </Typography>

          {!hasHistory ? (
            <Alert severity="info">
              Nenhum histórico de alterações encontrado.
            </Alert>
          ) : (
            <Timeline
              sx={{
                [`& .MuiTimelineItem-root:before`]: {
                  flex: 0,
                  padding: 0,
                },
                padding: 0,
              }}
            >
              {(detailedHistory || events).map((event, index) => {
                const action = "action" in event ? event.action : "CREATED";
                const config = ACTION_CONFIG[action] || ACTION_CONFIG.CREATED;
                const isLast = index === (detailedHistory || events).length - 1;

                // Handle both event types
                const timestamp =
                  "timestamp" in event ? event.timestamp : event.createdAt;
                const planName =
                  "currentPlan" in event
                    ? event.currentPlan
                    : event.newPlanName;
                const previousPlan =
                  "previousPlan" in event
                    ? event.previousPlan
                    : event.previousPlanName;
                const description =
                  "description" in event ? event.description : event.reason;

                return (
                  <TimelineItem key={event.id}>
                    <TimelineSeparator>
                      <TimelineDot
                        color={config.color}
                        sx={{
                          boxShadow: 2,
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {config.icon}
                      </TimelineDot>
                      {!isLast && (
                        <TimelineConnector
                          sx={{
                            bgcolor: "grey.300",
                            width: 2,
                            minHeight: 40,
                          }}
                        />
                      )}
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: 1, px: 3 }}>
                      <Card
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderLeft: 4,
                          borderLeftColor: `${config.color}.main`,
                          bgcolor: "background.paper",
                          "&:hover": {
                            boxShadow: 1,
                          },
                        }}
                      >
                        <Box className="flex items-center justify-between mb-2">
                          <Chip
                            label={config.label}
                            color={config.color}
                            size="small"
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            {formatDate(timestamp)}
                          </Typography>
                        </Box>

                        {planName && (
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold", mb: 0.5 }}
                          >
                            {planName}
                          </Typography>
                        )}

                        {previousPlan && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            De: <strong>{previousPlan}</strong>
                          </Typography>
                        )}

                        {description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 1,
                              pt: 1,
                              borderTop: 1,
                              borderColor: "divider",
                            }}
                          >
                            {description}
                          </Typography>
                        )}
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                );
              })}
            </Timeline>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
