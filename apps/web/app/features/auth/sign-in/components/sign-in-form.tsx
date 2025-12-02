import Link from "next/link";

import { Controller, UseFormReturn } from "react-hook-form";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

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
        <Box className="rounded-lg bg-red-50 border border-red-200 p-4">
          <Typography className="text-sm font-medium text-red-900">
            {errorMessage}
          </Typography>
        </Box>
      )}

      {successMessage && (
        <Box className="rounded-lg bg-green-50 border border-green-200 p-4">
          <Typography className="text-sm font-medium text-green-900">
            {successMessage}
          </Typography>
        </Box>
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
              disabled={isLoading}
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
              disabled={isLoading}
              helperText={form.formState.errors.password?.message}
              error={!!form.formState.errors.password}
              {...field}
            />
          )}
        />

        {/* 2FA Code Field - shown when 2FA is required */}
        {requiresTwoFactor && (
          <Controller
            control={form.control}
            name="twoFactorToken"
            render={({ field }) => (
              <Box className="mb-8 space-y-4">
                <Box>
                  <Alert severity="warning">
                    Código de autenticação de dois fatores.
                  </Alert>
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    type="text"
                    label="Código 2FA"
                    placeholder="000000"
                    disabled={isLoading}
                    inputProps={{ maxLength: 6 }}
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </Box>
              </Box>
            )}
          />
        )}

        {/* Submit Button */}
        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? (
            <Box className="flex items-center gap-2">
              <CircularProgress color="inherit" size={20} />
              Entrando...
            </Box>
          ) : (
            "Entrar"
          )}
        </Button>

        {/* Sign Up Link */}
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
