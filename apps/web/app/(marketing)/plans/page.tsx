"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

import { UserType } from "@/app/shared/types";
import {
  PlanType,
  CandidatePlanType,
  CompanyPlanType,
  getPlansForUserType,
  formatPrice,
  isFreePlan,
  DEFAULT_CANDIDATE_PLAN,
  DEFAULT_COMPANY_PLAN,
} from "@/app/libs/plans-data";
import { PlanCard } from "@/app/features/plans";

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
    const params = new URLSearchParams({
      type: userType,
      plan: selectedPlan,
    });
    router.push(`/auth/sign-up?${params.toString()}`);
  };

  const selectedPlanData = plans.find((p) => p.value === selectedPlan);
  const isFreeSelected = selectedPlanData && isFreePlan(selectedPlanData);

  return (
    <Box className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50">
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
                {" - "}
                {formatPrice(selectedPlanData.price, selectedPlanData.currency)}
                {selectedPlanData.price > 0 && "/mês"}
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            size="large"
            onClick={handleContinue}
            endIcon={<ArrowForwardIcon />}
          >
            {isFreeSelected ? "Criar Conta Grátis" : "Continuar para Cadastro"}
          </Button>
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
