"use client";

import { Controller } from "react-hook-form";
import Link from "next/link";

import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

import { useResetPasswordForm } from "../hooks/use-reset-password-form";

/**
 * Componente de formulário para redefinição de senha
 * Usa React Query para gerenciar estados de loading/error/success
 */
export const ResetPassword = () => {
  const {
    form,
    onSubmit,
    token,
    isLoading,
    isSuccess,
    isError,
    errorMessage,
    successMessage,
  } = useResetPasswordForm();

  // Verificar se o token está presente
  if (!token) {
    return (
      <Box className="space-y-4 text-center">
        <Alert severity="error">
          Token de redefinição não encontrado. Verifique o link recebido por
          email.
        </Alert>
        <Link href="/auth/forgot-password">
          <Button variant="outlined" fullWidth>
            Solicitar nova redefinição
          </Button>
        </Link>
      </Box>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Success Message */}
      {isSuccess && successMessage && (
        <Alert severity="success">
          {successMessage}
          <Typography variant="caption" display="block" mt={1}>
            Redirecionando para o login...
          </Typography>
        </Alert>
      )}

      {/* Error Message */}
      {isError && errorMessage && (
        <Alert severity="error">{errorMessage}</Alert>
      )}

      {/* Form Fields - Hide when success */}
      {!isSuccess && (
        <Box className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <TextField
                fullWidth
                type="password"
                label="Nova Senha"
                placeholder="Digite sua nova senha"
                disabled={isLoading}
                error={!!form.formState.errors.newPassword}
                helperText={form.formState.errors.newPassword?.message}
                {...field}
              />
            )}
          />

          <Controller
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <TextField
                fullWidth
                type="password"
                label="Confirmar Senha"
                placeholder="Confirme sua nova senha"
                disabled={isLoading}
                error={!!form.formState.errors.confirmPassword}
                helperText={form.formState.errors.confirmPassword?.message}
                {...field}
              />
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ mt: 2, py: 1.5 }}
          >
            {isLoading ? (
              <Box className="flex items-center gap-2">
                <CircularProgress size={20} color="inherit" />
                Processando...
              </Box>
            ) : (
              "Redefinir Senha"
            )}
          </Button>

          {/* Back to Login */}
          <Box className="text-center mt-4">
            <Typography variant="caption" className="text-gray-600">
              Lembrou sua senha?{" "}
              <Link
                href="/auth/sign-in"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Voltar ao Login
              </Link>
            </Typography>
          </Box>
        </Box>
      )}
    </form>
  );
};
