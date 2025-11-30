"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

import { Logo } from "@/app/components/logo";
import { UserType } from "@/app/features/auth/sign-up/types";
import {
  PlanType,
  CandidatePlanType,
  CompanyPlanType,
  getPlansForUserType,
  formatPrice,
  DEFAULT_CANDIDATE_PLAN,
  DEFAULT_COMPANY_PLAN,
  PlanOption,
} from "@/app/features/auth/sign-up/components/plans-data";

// =============================================
// PLAN CARD COMPONENT
// =============================================

interface PlanCardProps {
  plan: PlanOption;
  isSelected: boolean;
  onSelect: () => void;
}

const PlanCard = ({ plan, isSelected, onSelect }: PlanCardProps) => {
  const isFree = plan.price === 0 && !plan.isTrial;
  const isEnterprise = plan.value === "ENTERPRISE";

  return (
    <Paper
      elevation={isSelected ? 8 : plan.isPopular ? 4 : 2}
      onClick={onSelect}
      sx={{
        p: 3,
        cursor: "pointer",
        border: isSelected
          ? "3px solid"
          : plan.isPopular
            ? "2px solid"
            : "1px solid",
        borderColor: isSelected
          ? "primary.main"
          : plan.isPopular
            ? "primary.light"
            : "grey.300",
        backgroundColor: isSelected ? "primary.50" : "white",
        transition: "all 0.2s ease-in-out",
        position: "relative",
        transform: plan.isPopular ? "scale(1.02)" : "none",
        "&:hover": {
          boxShadow: 8,
          borderColor: "primary.main",
          transform: "scale(1.02)",
        },
      }}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <Box
          sx={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "primary.main",
            color: "white",
            px: 3,
            py: 0.75,
            borderRadius: 3,
            fontSize: "0.8rem",
            fontWeight: "bold",
            boxShadow: 3,
          }}
        >
          ⭐ Mais Popular
        </Box>
      )}

      {/* Trial Badge */}
      {plan.isTrial && plan.trialDays && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "success.main",
            color: "white",
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: "0.7rem",
            fontWeight: "bold",
          }}
        >
          {plan.trialDays} dias grátis
        </Box>
      )}

      {/* Free Badge */}
      {isFree && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: "success.main",
            color: "white",
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: "0.7rem",
            fontWeight: "bold",
          }}
        >
          Grátis
        </Box>
      )}

      {/* Plan Name */}
      <Typography
        variant="h5"
        fontWeight="bold"
        textAlign="center"
        mb={1}
        mt={plan.isPopular ? 2 : 0}
      >
        {plan.label}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        mb={2}
        sx={{ minHeight: 48 }}
      >
        {plan.description}
      </Typography>

      {/* Price */}
      <Box textAlign="center" mb={3}>
        {isEnterprise ? (
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Sob consulta
          </Typography>
        ) : (
          <>
            <Typography
              variant="h3"
              fontWeight="bold"
              color={isFree ? "success.main" : "primary.main"}
            >
              {formatPrice(plan.price, plan.currency)}
            </Typography>
            {plan.price > 0 && (
              <Typography variant="body2" color="text.secondary">
                por mês
              </Typography>
            )}
          </>
        )}
      </Box>

      {/* Features */}
      <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, mb: 2 }}>
        {plan.features.map((feature, index) => (
          <Box
            component="li"
            key={index}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              py: 0.5,
              fontSize: "0.875rem",
            }}
          >
            <Box
              component="span"
              sx={{ color: "success.main", fontWeight: "bold", mt: 0.25 }}
            >
              ✓
            </Box>
            <span>{feature}</span>
          </Box>
        ))}
      </Box>

      {/* Select Button */}
      <Button
        fullWidth
        variant={isSelected ? "contained" : "outlined"}
        color="primary"
        sx={{ mt: 2 }}
      >
        {isSelected ? "✓ Selecionado" : "Selecionar Plano"}
      </Button>
    </Paper>
  );
};

// =============================================
// PLANS PAGE
// =============================================

const PlansPage = () => {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(UserType.CANDIDATE);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    DEFAULT_CANDIDATE_PLAN
  );

  const plans = getPlansForUserType(
    userType === UserType.CANDIDATE ? "candidate" : "company"
  );

  const handleUserTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: UserType | null
  ) => {
    if (newType) {
      setUserType(newType);
      setSelectedPlan(
        newType === UserType.CANDIDATE
          ? DEFAULT_CANDIDATE_PLAN
          : DEFAULT_COMPANY_PLAN
      );
    }
  };

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    // Redirect to sign-up with selected plan and user type
    const params = new URLSearchParams({
      type: userType,
      plan: selectedPlan,
    });
    router.push(`/auth/sign-up?${params.toString()}`);
  };

  const handleEnterprise = () => {
    window.open(
      "mailto:comercial@talentloop.com?subject=Interesse no Plano Enterprise",
      "_blank"
    );
  };

  const selectedPlanData = plans.find((p) => p.value === selectedPlan);
  const isFreeSelected =
    selectedPlanData?.price === 0 && !selectedPlanData?.isTrial;
  const isEnterpriseSelected = selectedPlan === "ENTERPRISE";

  return (
    <Box className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <Box
        sx={{
          py: 3,
          borderBottom: "1px solid",
          borderColor: "grey.200",
          bgcolor: "white",
        }}
      >
        <Container maxWidth="lg">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Link href="/">
              <Logo />
            </Link>
            <Button variant="outlined" href="/auth/sign-in" component={Link}>
              Já tenho conta
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Title */}
        <Box textAlign="center" mb={5}>
          <Typography
            variant="h3"
            fontWeight="bold"
            className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            mb={2}
          >
            Escolha o plano ideal para você
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={4}>
            Comece gratuitamente ou escolha um plano que se adapte às suas
            necessidades
          </Typography>

          {/* User Type Toggle */}
          <ToggleButtonGroup
            value={userType}
            exclusive
            onChange={handleUserTypeChange}
            sx={{
              bgcolor: "white",
              borderRadius: 3,
              boxShadow: 2,
              "& .MuiToggleButton-root": {
                px: 4,
                py: 1.5,
                border: "none",
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                },
              },
            }}
          >
            <ToggleButton value={UserType.CANDIDATE}>
              <PersonIcon sx={{ mr: 1 }} />
              Candidato
            </ToggleButton>
            <ToggleButton value={UserType.COMPANY}>
              <BusinessIcon sx={{ mr: 1 }} />
              Empresa
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Plans Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: `repeat(${plans.length}, 1fr)`,
            },
            gap: 4,
            mb: 5,
          }}
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.value}
              plan={plan}
              isSelected={selectedPlan === plan.value}
              onSelect={() =>
                handlePlanSelect(
                  plan.value as CandidatePlanType | CompanyPlanType
                )
              }
            />
          ))}
        </Box>

        {/* Continue Section */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          {selectedPlanData && (
            <Box mb={3}>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Você selecionou:
              </Typography>
              <Typography variant="h4" fontWeight="bold" mb={1}>
                {selectedPlanData.label}
                {!isEnterpriseSelected && (
                  <>
                    {" - "}
                    {formatPrice(
                      selectedPlanData.price,
                      selectedPlanData.currency
                    )}
                    {selectedPlanData.price > 0 && "/mês"}
                  </>
                )}
              </Typography>
              {selectedPlanData.isTrial && selectedPlanData.trialDays && (
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  🎁 Inclui {selectedPlanData.trialDays} dias de teste grátis!
                </Typography>
              )}
            </Box>
          )}

          {isEnterpriseSelected ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleEnterprise}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                px: 5,
                py: 1.5,
                fontSize: "1.1rem",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              Falar com Vendas
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                px: 5,
                py: 1.5,
                fontSize: "1.1rem",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              {isFreeSelected
                ? "Criar Conta Grátis"
                : "Continuar para Cadastro"}
            </Button>
          )}
        </Paper>

        {/* Trust Badges */}
        <Box
          display="flex"
          justifyContent="center"
          gap={4}
          mt={4}
          flexWrap="wrap"
        >
          <Typography variant="body2" color="text.secondary">
            🔒 100% Seguro
          </Typography>
          <Typography variant="body2" color="text.secondary">
            💳 Pagamento Criptografado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ❌ Cancele a qualquer momento
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PlansPage;
