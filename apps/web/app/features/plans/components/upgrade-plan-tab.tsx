"use client";

import { memo, useState, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { CheckCircle, Cancel, Rocket } from "@mui/icons-material";

import {
  useAvailablePlans,
  useTenantInfo,
  useUpgradePlan,
  useCheckoutSession,
} from "../hooks";
import { AvailablePlan, TenantType, getPlanOrder, isFreePlan } from "../types";
import {
  getPlanConfig,
  getPlanDisplayName,
  formatPlanPrice,
  getPlansPath,
} from "../config";

interface UpgradePlanTabProps {
  tenantType: TenantType;
}

// Memoized PlanCard component to avoid re-renders
interface PlanCardProps {
  plan: AvailablePlan;
  tenantType: TenantType;
  isCurrentPlan: boolean;
  canUpgrade: boolean;
  isProcessing: boolean;
  onUpgrade: (plan: AvailablePlan) => void;
}

const PlanCard = memo(
  ({
    plan,
    tenantType,
    isCurrentPlan,
    canUpgrade,
    isProcessing,
    onUpgrade,
  }: PlanCardProps) => {
    const planConfig = useMemo(
      () => getPlanConfig(plan.name, tenantType),
      [plan.name, tenantType]
    );

    const handleClick = useCallback(() => onUpgrade(plan), [onUpgrade, plan]);

    const { usersDisplay, contactsDisplay } = useMemo(
      () => ({
        usersDisplay:
          plan.maxUsers === null || plan.maxUsers === -1
            ? "Usuários ilimitados"
            : `${plan.maxUsers} usuários`,
        contactsDisplay:
          plan.maxContacts === null || plan.maxContacts === -1
            ? "Contatos ilimitados"
            : `${plan.maxContacts} contatos`,
      }),
      [plan.maxUsers, plan.maxContacts]
    );

    const buttonColor = useMemo(
      () => (planConfig.color === "inherit" ? "primary" : planConfig.color),
      [planConfig.color]
    );

    return (
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: isCurrentPlan ? "2px solid" : undefined,
          borderColor: isCurrentPlan ? "primary.main" : undefined,
          position: "relative",
        }}
      >
        {isCurrentPlan && (
          <Chip
            label="Plano Atual"
            color="primary"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        )}
        <CardContent sx={{ flexGrow: 1, pt: isCurrentPlan ? 5 : 2 }}>
          <Box className="text-center mb-4">
            <Box
              sx={{
                display: "inline-flex",
                p: 1,
                borderRadius: "50%",
                bgcolor: `${planConfig.color}.light`,
                color: `${planConfig.color}.main`,
                mb: 1,
              }}
            >
              {planConfig.icon}
            </Box>
            <Typography variant="h5" className="font-bold">
              {planConfig.displayName}
            </Typography>
            <Typography variant="h4" className="font-bold mt-2">
              {formatPlanPrice(plan.price, plan.currency)}
            </Typography>
            {plan.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-1"
              >
                {plan.description}
              </Typography>
            )}
          </Box>

          <Divider className="my-4" />

          <List dense>
            {(plan.features ?? []).map((feature, index) => (
              <ListItem key={index} disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={feature}
                  primaryTypographyProps={{
                    variant: "body2",
                    color: "text.primary",
                  }}
                />
              </ListItem>
            ))}

            {/* Plan limits */}
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={usersDisplay}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={contactsDisplay}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {plan.hasAPI ? (
                  <CheckCircle color="success" fontSize="small" />
                ) : (
                  <Cancel color="disabled" fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Acesso à API"
                primaryTypographyProps={{
                  variant: "body2",
                  color: plan.hasAPI ? "text.primary" : "text.disabled",
                }}
              />
            </ListItem>
          </List>
        </CardContent>

        <Box sx={{ p: 2, pt: 0 }}>
          {isCurrentPlan ? (
            <Button variant="outlined" fullWidth disabled>
              Plano Atual
            </Button>
          ) : canUpgrade ? (
            <Button
              variant="contained"
              color={buttonColor}
              fullWidth
              onClick={handleClick}
              disabled={isProcessing}
              startIcon={
                isProcessing ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Rocket />
                )
              }
            >
              {isProcessing ? "Processando..." : `Fazer Upgrade`}
            </Button>
          ) : (
            <Button variant="outlined" fullWidth disabled>
              Plano inferior
            </Button>
          )}
        </Box>
      </Card>
    );
  }
);

PlanCard.displayName = "PlanCard";

export const UpgradePlanTab = memo(({ tenantType }: UpgradePlanTabProps) => {
  const { data: plans, isLoading: isLoadingPlans } = useAvailablePlans();
  const { data: tenantInfo, isLoading: isLoadingInfo } = useTenantInfo();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  const { mutate: upgradePlan, isPending: isUpgrading } = useUpgradePlan({
    onSuccess: (data) => {
      setSelectedPlan(null);
      if (data.success) {
        setFeedback({
          type: "success",
          message: data.message || "Plano atualizado com sucesso!",
        });
      } else {
        setFeedback({
          type: "error",
          message: data.message || "Erro ao atualizar plano",
        });
      }
    },
    onError: (error) => {
      setSelectedPlan(null);
      setFeedback({
        type: "error",
        message: error.message || "Erro inesperado ao atualizar plano",
      });
    },
  });

  const { mutate: createCheckout, isPending: isCreatingCheckout } =
    useCheckoutSession({
      onSuccess: (data) => {
        setSelectedPlan(null);
        if (data.success && data.url) {
          // Store sessionId in localStorage for verification after return from Stripe
          if (data.sessionId) {
            localStorage.setItem("stripe_checkout_session_id", data.sessionId);
          }
          window.location.href = data.url;
        } else {
          setFeedback({
            type: "error",
            message: data.message || "Erro ao criar sessão de checkout",
          });
        }
      },
      onError: (error) => {
        setSelectedPlan(null);
        setFeedback({
          type: "error",
          message: error.message || "Erro inesperado ao criar checkout",
        });
      },
    });

  const isLoading = isLoadingPlans || isLoadingInfo;

  // Memoize computed values from tenant info
  const {
    currentPlanName,
    currentPlanOrder,
    isCurrentlyFree,
    plansPath,
    currentPlanDisplayName,
  } = useMemo(() => {
    if (!tenantInfo)
      return {
        currentPlanName: "",
        currentPlanOrder: 0,
        isCurrentlyFree: true,
        plansPath: "",
        currentPlanDisplayName: "",
      };
    return {
      currentPlanName: tenantInfo.plan.name,
      currentPlanOrder: getPlanOrder(tenantInfo.plan.name, tenantType),
      isCurrentlyFree: isFreePlan(tenantInfo.plan.name, tenantType),
      plansPath: getPlansPath(tenantType),
      currentPlanDisplayName: getPlanDisplayName(
        tenantInfo.plan.name,
        tenantType
      ),
    };
  }, [tenantInfo, tenantType]);

  // Memoize canUpgradeTo function
  const canUpgradeTo = useCallback(
    (plan: AvailablePlan): boolean => {
      const planOrder = getPlanOrder(plan.name, tenantType);
      return planOrder > currentPlanOrder;
    },
    [currentPlanOrder, tenantType]
  );

  // Memoize handleUpgrade callback
  const handleUpgrade = useCallback(
    (plan: AvailablePlan) => {
      setSelectedPlan(plan.name);
      setFeedback(null);

      // If user is on FREE plan (candidates only), use checkout session to create new subscription
      // If user already has a paid plan, use upgradePlan with stripePriceId
      if (isCurrentlyFree && plan.stripePriceId) {
        const baseUrl = window.location.origin;
        createCheckout({
          priceId: plan.stripePriceId,
          successUrl: `${baseUrl}${plansPath}?success=true`,
          cancelUrl: `${baseUrl}${plansPath}?cancelled=true`,
        });
      } else if (plan.stripePriceId) {
        // User already has a paid plan - upgrade via Stripe
        upgradePlan({ stripePriceId: plan.stripePriceId });
      } else {
        // Direct upgrade (e.g., for testing or internal plans)
        upgradePlan({ newPlan: plan.name });
      }
    },
    [isCurrentlyFree, plansPath, createCheckout, upgradePlan]
  );

  // Memoize grid columns based on number of plans
  const gridCols = useMemo(
    () => (plans?.length === 3 ? 4 : 3),
    [plans?.length]
  );

  // Memoize title based on tenant type
  const title = useMemo(
    () =>
      tenantType === "CANDIDATE"
        ? "Escolha seu Plano"
        : "Escolha seu Plano Empresarial",
    [tenantType]
  );

  // Memoize info alert message
  const infoMessage = useMemo(
    () =>
      isCurrentlyFree ? (
        <>
          <strong>Nota:</strong> Ao fazer upgrade, você será redirecionado para
          o checkout seguro do Stripe para completar o pagamento.
        </>
      ) : (
        <>
          <strong>Nota:</strong> Ao fazer upgrade, o valor será ajustado
          proporcionalmente. A diferença de preço será cobrada na sua próxima
          fatura.
        </>
      ),
    [isCurrentlyFree]
  );

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (!plans || !tenantInfo) {
    return (
      <Alert severity="error">
        Erro ao carregar planos. Tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <Box className="space-y-6">
      {feedback && (
        <Alert severity={feedback.type} onClose={clearFeedback}>
          {feedback.message}
        </Alert>
      )}

      <Box className="mb-4">
        <Typography variant="h6" className="mb-2">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Seu plano atual: <strong>{currentPlanDisplayName}</strong>
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {plans.map((plan) => {
          const isCurrentPlan = plan.name === currentPlanName;
          const canUpgrade = canUpgradeTo(plan);
          const isPlanSelected = selectedPlan === plan.name;
          const isProcessing =
            isPlanSelected && (isUpgrading || isCreatingCheckout);

          return (
            <Grid key={plan.id} size={{ xs: 12, md: gridCols }}>
              <PlanCard
                plan={plan}
                tenantType={tenantType}
                isCurrentPlan={isCurrentPlan}
                canUpgrade={canUpgrade}
                isProcessing={isProcessing}
                onUpgrade={handleUpgrade}
              />
            </Grid>
          );
        })}
      </Grid>

      <Alert severity="info" className="mt-4">
        <Typography variant="body2">{infoMessage}</Typography>
      </Alert>
    </Box>
  );
});

UpgradePlanTab.displayName = "UpgradePlanTab";
