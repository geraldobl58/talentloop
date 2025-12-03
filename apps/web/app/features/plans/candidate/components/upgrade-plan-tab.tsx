"use client";

import { useState } from "react";
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
import {
  CheckCircle,
  Cancel,
  Star,
  Rocket,
  WorkspacePremium,
} from "@mui/icons-material";

import {
  useAvailablePlans,
  useTenantInfo,
  useUpgradePlan,
  useCheckoutSession,
} from "../hooks/use-plan-candidate";
import { AvailablePlan, CandidatePlanName } from "../types/plan";

// Plan order for comparison
const PLAN_ORDER: Record<CandidatePlanName, number> = {
  FREE: 0,
  PRO: 1,
  PREMIUM: 2,
};

// Plan icons mapping
const PLAN_ICONS: Record<CandidatePlanName, React.ReactElement> = {
  FREE: <Star />,
  PRO: <Rocket />,
  PREMIUM: <WorkspacePremium />,
};

// Plan colors mapping
const PLAN_COLORS: Record<
  CandidatePlanName,
  "inherit" | "primary" | "secondary"
> = {
  FREE: "inherit",
  PRO: "primary",
  PREMIUM: "secondary",
};

export const UpgradePlanTab = () => {
  const { data: plans, isLoading: isLoadingPlans } = useAvailablePlans();
  const { data: tenantInfo, isLoading: isLoadingInfo } = useTenantInfo();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

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

  const currentPlanName = tenantInfo.plan.name;
  const currentPlanOrder = PLAN_ORDER[currentPlanName];
  const isCurrentlyFree = currentPlanName === "FREE";

  const canUpgradeTo = (plan: AvailablePlan): boolean => {
    const planOrder = PLAN_ORDER[plan.name];
    return planOrder > currentPlanOrder;
  };

  const handleUpgrade = (plan: AvailablePlan) => {
    setSelectedPlan(plan.name);
    setFeedback(null);

    // If user is on FREE plan, use checkout session to create new subscription
    // If user already has a paid plan, use upgradePlan with stripePriceId
    if (isCurrentlyFree && plan.stripePriceId) {
      const baseUrl = window.location.origin;
      createCheckout({
        priceId: plan.stripePriceId,
        successUrl: `${baseUrl}/my-plans?success=true`,
        cancelUrl: `${baseUrl}/my-plans?cancelled=true`,
      });
    } else if (plan.stripePriceId) {
      // User already has a paid plan - upgrade via Stripe
      upgradePlan({ stripePriceId: plan.stripePriceId });
    } else {
      // Direct upgrade (e.g., for testing or internal plans)
      upgradePlan({ newPlan: plan.name });
    }
  };

  const formatPrice = (plan: AvailablePlan): string => {
    if (plan.price === 0) return "Grátis";
    return `${plan.currency} ${plan.price.toFixed(2)}/mês`;
  };

  return (
    <Box className="space-y-6">
      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <Box className="mb-4">
        <Typography variant="h6" className="mb-2">
          Escolha seu Plano
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Seu plano atual: <strong>{currentPlanName}</strong>
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
            <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
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
                      left: "15%",
                      transform: "translateX(-50%)",
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1, pt: isCurrentPlan ? 3 : 2 }}>
                  <Box className="text-center mb-4">
                    <Box
                      sx={{
                        display: "inline-flex",
                        p: 1,
                        borderRadius: "50%",
                        bgcolor: `${PLAN_COLORS[plan.name]}.light`,
                        color: `${PLAN_COLORS[plan.name]}.main`,
                        mb: 1,
                      }}
                    >
                      {PLAN_ICONS[plan.name]}
                    </Box>
                    <Typography variant="h5" className="font-bold">
                      {plan.name}
                    </Typography>
                    <Typography variant="h4" className="font-bold mt-2">
                      {formatPrice(plan)}
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
                        primary={
                          plan.maxUsers === null || plan.maxUsers === -1
                            ? "Usuários ilimitados"
                            : `${plan.maxUsers} usuários`
                        }
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          plan.maxContacts === null || plan.maxContacts === -1
                            ? "Contatos ilimitados"
                            : `${plan.maxContacts} contatos`
                        }
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
                      color={PLAN_COLORS[plan.name]}
                      fullWidth
                      onClick={() => handleUpgrade(plan)}
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
            </Grid>
          );
        })}
      </Grid>

      <Alert severity="info" className="mt-4">
        <Typography variant="body2">
          {isCurrentlyFree ? (
            <>
              <strong>Nota:</strong> Ao fazer upgrade, você será redirecionado
              para o checkout seguro do Stripe para completar o pagamento.
            </>
          ) : (
            <>
              <strong>Nota:</strong> Ao fazer upgrade, o valor será ajustado
              proporcionalmente. A diferença de preço será cobrada na sua
              próxima fatura.
            </>
          )}
        </Typography>
      </Alert>
    </Box>
  );
};
