"use client";

import { Box, Typography } from "@mui/material";
import { AuthContainer } from "@/app/features/auth/sign-in/components";

const ForgotPasswordPage = () => {
  return (
    <AuthContainer
      title="Redefinição de Senha"
      subtitle="Insira seu e-mail para receber instruções de redefinição"
    >
      <Box className="text-center py-8">
        <Typography color="text.secondary">
          Formulário de recuperação de senha em desenvolvimento...
        </Typography>
      </Box>
    </AuthContainer>
  );
};

export default ForgotPasswordPage;
