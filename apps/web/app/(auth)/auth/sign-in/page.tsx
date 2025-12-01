"use client";

import { Box, Typography } from "@mui/material";

import {
  AuthContainer,
  SignInForm,
} from "@/app/features/auth/sign-in/components";
import { useSignInForm } from "@/app/features/auth/sign-in/hooks";

/**
 * Página de signin unificada
 * O tipo de usuário (candidato ou empresa) é detectado automaticamente pelo backend pelo email
 */
const AuthSignInPage = () => {
  const {
    form,
    onSubmit,
    isLoading,
    errorMessage,
    successMessage,
    requiresTwoFactor,
  } = useSignInForm();

  return (
    <AuthContainer>
      <Box className="p-6">
        <Typography variant="h5" className="text-center mb-4 font-semibold">
          Entrar
        </Typography>
        <Typography variant="body2" className="text-center text-gray-600 mb-6">
          Entre com sua conta de candidato ou empresa
        </Typography>
        <SignInForm
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading}
          errorMessage={errorMessage}
          successMessage={successMessage}
          requiresTwoFactor={requiresTwoFactor}
        />
      </Box>
    </AuthContainer>
  );
};

export default AuthSignInPage;
