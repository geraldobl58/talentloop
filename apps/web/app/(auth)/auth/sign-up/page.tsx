"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { Box, Typography, Chip } from "@mui/material";

import {
  AuthContainer,
  AuthTabPanel,
  AuthTabs,
} from "@/app/features/auth/sign-in/components";

import { UserType } from "@/app/features/auth/sign-up/types";
import {
  CandidateSignUpForm,
  CompanySignUpForm,
  getPlanByValue,
  formatPrice,
  PlanType,
} from "@/app/features/auth/sign-up/components";
import {
  useSignUpCandidateForm,
  useSignUpCompanyForm,
} from "@/app/features/auth/sign-up/hooks";

const SignUpPage = () => {
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
            color="primary"
            variant="outlined"
            sx={{ px: 2, py: 2.5 }}
          />
          {planData.isTrial && planData.trialDays && (
            <Typography
              variant="caption"
              color="success.main"
              display="block"
              mt={1}
            >
              🎁 {planData.trialDays} dias de teste grátis incluídos!
            </Typography>
          )}
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

export default SignUpPage;
