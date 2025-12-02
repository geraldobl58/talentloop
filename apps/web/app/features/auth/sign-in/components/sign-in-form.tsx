import Link from "next/link";

import { Controller, UseFormReturn } from "react-hook-form";

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Collapse,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Security as SecurityIcon } from "@mui/icons-material";

import { FormSignInData } from "../schemas/sign-in";

interface SignInFormProps {
  form: UseFormReturn<FormSignInData>;
  onSubmit: (values: FormSignInData) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string;
  successMessage?: string;
  requiresTwoFactor?: boolean;
}

/**
 * Formulário unificado de signin
 * O tipo de usuário (candidato ou empresa) é detectado automaticamente pelo backend
 */
export const SignInForm = ({
  form,
  onSubmit,
  isLoading = false,
  errorMessage,
  successMessage,
  requiresTwoFactor = false,
}: SignInFormProps) => {
  const handleSubmit = async (values: FormSignInData) => {
    await onSubmit(values);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
      {/* Status Messages */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Box className="flex flex-col gap-4">
        {/* Email Field */}
        <Controller
          control={form.control}
          name="email"
          render={({ field }) => (
            <TextField
              fullWidth
              margin="normal"
              type="email"
              label="Email"
              placeholder="seu@email.com"
              disabled={isLoading || requiresTwoFactor}
              helperText={form.formState.errors.email?.message}
              error={!!form.formState.errors.email}
              {...field}
            />
          )}
        />

        {/* Password Field */}
        <Controller
          control={form.control}
          name="password"
          render={({ field }) => (
            <TextField
              fullWidth
              margin="normal"
              type="password"
              label="Senha"
              placeholder="••••••••"
              disabled={isLoading || requiresTwoFactor}
              helperText={form.formState.errors.password?.message}
              error={!!form.formState.errors.password}
              {...field}
            />
          )}
        />

        {/* 2FA Code Field - shown when 2FA is required */}
        <Collapse in={requiresTwoFactor}>
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning" icon={<SecurityIcon />} sx={{ mb: 2 }}>
              <AlertTitle>Autenticação de dois fatores</AlertTitle>
              Digite o código de 6 dígitos do seu app autenticador
            </Alert>

            <Controller
              control={form.control}
              name="twoFactorToken"
              render={({ field }) => (
                <TextField
                  fullWidth
                  type="text"
                  label="Código 2FA"
                  placeholder="000000"
                  disabled={isLoading}
                  autoFocus={requiresTwoFactor}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SecurityIcon color="action" />
                        </InputAdornment>
                      ),
                    },
                    htmlInput: {
                      maxLength: 6,
                      style: {
                        textAlign: "center",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        letterSpacing: "0.5rem",
                      },
                    },
                  }}
                  helperText={form.formState.errors.twoFactorToken?.message}
                  error={!!form.formState.errors.twoFactorToken}
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(/\D/g, ""))
                  }
                />
              )}
            />
          </Box>
        </Collapse>

        {/* Submit Button */}
        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? (
            <Box className="flex items-center gap-2">
              <CircularProgress color="inherit" size={20} />
              {requiresTwoFactor ? "Verificando..." : "Entrando..."}
            </Box>
          ) : requiresTwoFactor ? (
            "Verificar código"
          ) : (
            "Entrar"
          )}
        </Button>

        {/* Forgot Password Link */}
        <Box className="flex flex-col items-center gap-1 mt-4">
          <Typography variant="caption" className="text-xs text-gray-600">
            Esqueceu sua senha?{" "}
            <Link
              href="/auth/forgot-password"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Redefinir Senha
            </Link>
          </Typography>
        </Box>
      </Box>
    </form>
  );
};
