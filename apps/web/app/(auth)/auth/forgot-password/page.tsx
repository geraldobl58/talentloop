"use client";

import { Box } from "@mui/material";
import { AuthContainer } from "@/app/features/auth/sign-in/components/auth-container";
import { ForgotPasswordForm } from "@/app/features/auth/forgot-password/components/forgot-password-form";
import { useForgotPasswordForm } from "@/app/features/auth/forgot-password/hooks/use-forgot-password-form";

const ForgotPasswordPage = () => {
  const { form, onSubmit, isLoading, errorMessage, successMessage } =
    useForgotPasswordForm();

  return (
    <AuthContainer
      title="Redefinição de Senha"
      subtitle="Insira seu e-mail para receber instruções de redefinição"
    >
      <Box className="text-center">
        <ForgotPasswordForm
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading}
          errorMessage={errorMessage}
          successMessage={successMessage}
        />
      </Box>
    </AuthContainer>
  );
};

export default ForgotPasswordPage;
