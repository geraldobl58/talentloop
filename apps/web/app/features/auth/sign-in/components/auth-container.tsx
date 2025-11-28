"use client";

import { Box, Paper, Typography } from "@mui/material";

import { Logo } from "@/app/components/logo";

interface AuthContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthContainer = ({
  children,
  title = "Talent Loop aqui é o seu futuro!",
  subtitle = "Faça parte da maior plataforma de empregos com IA",
}: AuthContainerProps) => {
  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-600 via-blue-500 to-purple-600 p-4">
      <Paper elevation={3} sx={{ width: "100%", maxWidth: 580 }}>
        <Box className="p-6 sm:p-8">
          <Box className="mb-6 flex flex-col items-center gap-2">
            <Logo />
            <Typography
              variant="h6"
              className="text-xl sm:text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center"
            >
              {title}
            </Typography>
            <Typography className="text-gray-600 text-xs sm:text-sm text-center">
              {subtitle}
            </Typography>
          </Box>
          {children}
        </Box>
      </Paper>
      <div className="mt-6 text-center">
        <p className="text-white/80 text-xs flex items-center justify-center gap-1">
          🔒100% Seguro e Criptografado
        </p>
      </div>
    </Box>
  );
};
