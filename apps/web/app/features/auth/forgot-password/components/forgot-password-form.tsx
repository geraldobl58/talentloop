import { Controller, UseFormReturn } from "react-hook-form";

import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { FormForgotPasswordData } from "../schemas/forgot-password";

interface ForgotPasswordFormProps {
  form: UseFormReturn<FormForgotPasswordData>;
  onSubmit: (values: FormForgotPasswordData) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string;
  successMessage?: string;
}

/**
 * Formulário de forgot password
 * O tenant é detectado automaticamente pelo backend através do email
 */
export const ForgotPasswordForm = ({
  form,
  onSubmit,
  isLoading = false,
  errorMessage,
  successMessage,
}: ForgotPasswordFormProps) => {
  const handleSubmit = async (values: FormForgotPasswordData) => {
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
              Enviando...
            </Box>
          ) : (
            "Enviar"
          )}
        </Button>
      </Box>
    </form>
  );
};
