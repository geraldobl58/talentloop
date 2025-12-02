import { Controller } from "react-hook-form";
import { TextField } from "@mui/material";
import { SignUpCandidateFormProps } from "../types/sign-up-candidate-form";
import { FormFooter } from "./form-footer";
import { StatusMessages } from "@/app/components/status-message";

export const SignUpCandidateForm = ({
  form,
  onSubmit,
  isLoading = false,
  errorMessage,
  successMessage,
}: SignUpCandidateFormProps) => {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
      <StatusMessages
        errorMessage={errorMessage}
        successMessage={successMessage}
      />

      {/* Nome */}
      <Controller
        control={form.control}
        name="name"
        render={({ field }) => (
          <TextField
            fullWidth
            type="text"
            margin="normal"
            label="Nome Completo"
            placeholder="Seu nome completo"
            disabled={isLoading}
            helperText={form.formState.errors.name?.message}
            error={!!form.formState.errors.name}
            {...field}
          />
        )}
      />

      {/* Email */}
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

      <FormFooter isLoading={isLoading} />
    </form>
  );
};
