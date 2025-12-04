"use client";

import { memo, useState, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Cancel, CreditCard, Refresh } from "@mui/icons-material";

import { formatDate } from "@/app/libs/plans-data";
import { useCancelPlan, useReactivatePlan, useBillingPortal } from "../hooks";
import { PlanInfo, TenantType, isFreePlan } from "../types";
import { getPlanDisplayName } from "../config";

interface PlanActionsCardProps {
  plan: PlanInfo;
  tenantType: TenantType;
  onFeedback: (feedback: {
    type: "success" | "error";
    message: string;
  }) => void;
}

export const PlanActionsCard = memo(
  ({ plan, tenantType, onFeedback }: PlanActionsCardProps) => {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    // Memoize computed values
    const {
      isFree,
      isPlanCancelled,
      displayName,
      expiryDate,
      canAccessBillingPortal,
      isActive,
    } = useMemo(() => {
      const free = isFreePlan(plan.name, tenantType);
      return {
        isFree: free,
        isPlanCancelled: plan.status === "CANCELLED",
        displayName: getPlanDisplayName(plan.name, tenantType),
        expiryDate: formatDate(plan.planExpiresAt),
        canAccessBillingPortal: !free,
        isActive: plan.status === "ACTIVE",
      };
    }, [plan, tenantType]);

    // Memoize dialog handlers
    const openCancelDialog = useCallback(() => setCancelDialogOpen(true), []);
    const closeCancelDialog = useCallback(() => setCancelDialogOpen(false), []);

    const { mutate: cancelPlan, isPending: isCancelling } = useCancelPlan({
      onSuccess: (data) => {
        closeCancelDialog();
        onFeedback({
          type: data.success ? "success" : "error",
          message:
            data.message ||
            (data.success ? "Plano cancelado!" : "Erro ao cancelar"),
        });
      },
      onError: (error) => {
        closeCancelDialog();
        onFeedback({
          type: "error",
          message: error.message || "Erro inesperado ao cancelar plano",
        });
      },
    });

    const { mutate: reactivatePlan, isPending: isReactivating } =
      useReactivatePlan({
        onSuccess: (data) => {
          onFeedback({
            type: data.success ? "success" : "error",
            message:
              data.message ||
              (data.success ? "Plano reativado!" : "Erro ao reativar"),
          });
        },
        onError: (error) => {
          onFeedback({
            type: "error",
            message: error.message || "Erro inesperado ao reativar plano",
          });
        },
      });

    const { mutate: openBillingPortal, isPending: isOpeningPortal } =
      useBillingPortal({
        onSuccess: (data) => {
          if (data.success && data.url) {
            window.open(data.url, "_blank");
          } else {
            onFeedback({
              type: "error",
              message: data.message || "Erro ao abrir portal de cobrança",
            });
          }
        },
        onError: (error) => {
          // Trata erro de customer não encontrado no Stripe
          const errorMessage = error.message || "";
          if (
            errorMessage.includes("No such customer") ||
            errorMessage.includes("Customer Stripe não encontrado")
          ) {
            onFeedback({
              type: "error",
              message:
                "Portal de pagamento não disponível. Por favor, entre em contato com o suporte.",
            });
          } else {
            onFeedback({
              type: "error",
              message: errorMessage || "Erro inesperado ao abrir portal",
            });
          }
        },
      });

    const handleOpenBillingPortal = useCallback(() => {
      const returnUrl = window.location.href;
      openBillingPortal(returnUrl);
    }, [openBillingPortal]);

    const handleCancelPlan = useCallback(() => cancelPlan(), [cancelPlan]);
    const handleReactivatePlan = useCallback(
      () => reactivatePlan(),
      [reactivatePlan]
    );

    // Memoize cancellation message based on tenant type
    const cancellationMessage = useMemo(() => {
      return tenantType === "CANDIDATE"
        ? "Após essa data, seu plano será revertido para FREE."
        : "Após essa data, será necessário contratar um novo plano para continuar usando os recursos.";
    }, [tenantType]);

    return (
      <>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" className="mb-4">
              Ações
            </Typography>

            <Box className="flex flex-wrap gap-3">
              {/* Billing Portal Button */}
              {canAccessBillingPortal && (
                <Button
                  variant="outlined"
                  startIcon={
                    isOpeningPortal ? (
                      <CircularProgress size={20} />
                    ) : (
                      <CreditCard />
                    )
                  }
                  onClick={handleOpenBillingPortal}
                  disabled={isOpeningPortal}
                >
                  Gerenciar Pagamentos
                </Button>
              )}

              {/* Reactivate Button - only for cancelled plans */}
              {isPlanCancelled && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    isReactivating ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Refresh />
                    )
                  }
                  onClick={handleReactivatePlan}
                  disabled={isReactivating}
                >
                  Reativar Plano
                </Button>
              )}

              {/* Cancel Button - only for active paid plans */}
              {isActive && !isFree && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={openCancelDialog}
                  disabled={isCancelling}
                >
                  Cancelar Plano
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onClose={closeCancelDialog}>
          <DialogTitle>Confirmar Cancelamento</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja cancelar seu plano {displayName}?
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-2">
              Você ainda terá acesso aos recursos até {expiryDate}.
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              {cancellationMessage}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeCancelDialog} disabled={isCancelling}>
              Voltar
            </Button>
            <Button
              onClick={handleCancelPlan}
              color="error"
              variant="contained"
              disabled={isCancelling}
              startIcon={
                isCancelling ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isCancelling ? "Cancelando..." : "Confirmar Cancelamento"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
);

PlanActionsCard.displayName = "PlanActionsCard";
