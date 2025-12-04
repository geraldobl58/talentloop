"use client";

import { useState } from "react";
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

export const PlanActionsCard = ({
  plan,
  tenantType,
  onFeedback,
}: PlanActionsCardProps) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const isFree = isFreePlan(plan.name, tenantType);
  const isPlanCancelled = plan.status === "CANCELLED";
  const displayName = getPlanDisplayName(plan.name, tenantType);

  const { mutate: cancelPlan, isPending: isCancelling } = useCancelPlan({
    onSuccess: (data) => {
      setCancelDialogOpen(false);
      onFeedback({
        type: data.success ? "success" : "error",
        message:
          data.message ||
          (data.success ? "Plano cancelado!" : "Erro ao cancelar"),
      });
    },
    onError: (error) => {
      setCancelDialogOpen(false);
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

  const handleOpenBillingPortal = () => {
    const returnUrl = window.location.href;
    openBillingPortal(returnUrl);
  };

  // Show billing portal for paid plans
  const canAccessBillingPortal = !isFree;

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
                onClick={() => reactivatePlan()}
                disabled={isReactivating}
              >
                Reativar Plano
              </Button>
            )}

            {/* Cancel Button - only for active paid plans */}
            {plan.status === "ACTIVE" && !isFree && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => setCancelDialogOpen(true)}
                disabled={isCancelling}
              >
                Cancelar Plano
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Confirmar Cancelamento</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja cancelar seu plano {displayName}?
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-2">
            Você ainda terá acesso aos recursos até{" "}
            {formatDate(plan.planExpiresAt)}.
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            {tenantType === "CANDIDATE"
              ? "Após essa data, seu plano será revertido para FREE."
              : "Após essa data, será necessário contratar um novo plano para continuar usando os recursos."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            disabled={isCancelling}
          >
            Voltar
          </Button>
          <Button
            onClick={() => cancelPlan()}
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
};
