"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { Box, Typography, Chip, CircularProgress } from "@mui/material";

import {
  AuthContainer,
  AuthTabPanel,
  AuthTabs,
} from "@/app/features/auth/sign-in/components";

import { PlanType, UserType } from "@/app/features/auth/sign-up/types";

import {
  useSignUpCandidateForm,
  useSignUpCompanyForm,
} from "@/app/features/auth/sign-up/hooks";
import { formatPrice, getPlanByValue } from "@/app/libs/plans-data";
import {
  CandidateSignUpForm,
  CompanySignUpForm,
} from "@/app/features/auth/sign-up/components/sign-up-form";

const SignUpContent = () => {
  const searchParams = useSearchParams();

  // Parse URL params
  const { initialUserType, selectedPlan } = useMemo(() => {
    const type = searchParams.get("type") as UserType | null;
    const plan = searchParams.get("plan") as PlanType | null;
    return {
      initialUserType: type || UserType.CANDIDATE,
      selectedPlan: plan,
    };
  }, [searchParams]);

  // Separate hooks for each user type
  const candidateForm = useSignUpCandidateForm(selectedPlan);
  const companyForm = useSignUpCompanyForm(selectedPlan);

  const planData = selectedPlan ? getPlanByValue(selectedPlan) : null;

  return (
    <AuthContainer
      title="Criação de Conta"
      subtitle="Insira seus dados para criar uma nova conta"
    >
      {/* Plan Badge */}
      {planData && (
        <Box textAlign="center" mb={2}>
          <Chip
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" fontWeight="bold">
                  Plano: {planData.label}
                </Typography>
                <Typography variant="body2">
                  {planData.price === 0
                    ? "Grátis"
                    : `${formatPrice(planData.price, planData.currency)}/mês`}
                </Typography>
              </Box>
            }
            color="secondary"
            variant="outlined"
            sx={{ px: 2, py: 2.5 }}
          />
        </Box>
      )}

      <AuthTabs value={initialUserType} onChange={() => {}}>
        <AuthTabPanel value={UserType.CANDIDATE}>
          <Box>
            <CandidateSignUpForm
              form={candidateForm.form}
              onSubmit={candidateForm.onSubmit}
              userType={UserType.CANDIDATE}
              isLoading={candidateForm.isLoading}
              errorMessage={candidateForm.errorMessage}
              successMessage={candidateForm.successMessage}
            />
          </Box>
        </AuthTabPanel>
        <AuthTabPanel value={UserType.COMPANY}>
          <Box>
            <CompanySignUpForm
              form={companyForm.form}
              onSubmit={companyForm.onSubmit}
              userType={UserType.COMPANY}
              isLoading={companyForm.isLoading}
              errorMessage={companyForm.errorMessage}
              successMessage={companyForm.successMessage}
            />
          </Box>
        </AuthTabPanel>
      </AuthTabs>
    </AuthContainer>
  );
};

const SignUpPage = () => {
  return (
    <Suspense
      fallback={
        <AuthContainer
          title="Criação de Conta"
          subtitle="Insira seus dados para criar uma nova conta"
        >
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        </AuthContainer>
      }
    >
      <SignUpContent />
    </Suspense>
  );
};

export default SignUpPage;
