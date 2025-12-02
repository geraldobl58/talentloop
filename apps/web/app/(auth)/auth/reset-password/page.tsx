"use client";

import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

import { AuthContainer } from "@/app/features/auth/sign-in/components/auth-container";
import { ResetPassword } from "@/app/features/auth/reset-password/components/reset-password";

const ResetPasswordContent = () => {
  return (
    <AuthContainer
      title="Redefinir Senha"
      subtitle="Digite sua nova senha abaixo"
    >
      <Box className="p-6">
        <ResetPassword />
      </Box>
    </AuthContainer>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <AuthContainer
          title="Redefinir Senha"
          subtitle="Digite sua nova senha abaixo"
        >
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        </AuthContainer>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
