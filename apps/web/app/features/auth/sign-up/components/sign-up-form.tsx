import Link from "next/link";
import { useEffect } from "react";

import { Controller, UseFormReturn } from "react-hook-form";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Link as LinkIcon,
} from "@mui/icons-material";

import { UserType } from "../types";
import { FormSignUpCandidateData, FormSignUpCompanyData } from "../schemas";

// =============================================
// STATUS MESSAGES COMPONENT
// =============================================

interface StatusMessagesProps {
  errorMessage?: string;
  successMessage?: string;
}

const StatusMessages = ({
  errorMessage,
  successMessage,
}: StatusMessagesProps) => (
  <>
    {errorMessage && (
      <Box className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
        <Typography className="text-sm font-medium text-red-900">
          {errorMessage}
        </Typography>
      </Box>
    )}

    {successMessage && (
      <Box className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
        <Typography className="text-sm font-medium text-green-900">
          {successMessage}
        </Typography>
      </Box>
    )}
  </>
);

// =============================================
// FORM FOOTER
// =============================================

interface FormFooterProps {
  isLoading: boolean;
}

const FormFooter = ({ isLoading }: FormFooterProps) => (
  <>
    {/* Submit Button */}
    <Box sx={{ mt: 3 }}>
      <Button
        fullWidth
        type="submit"
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ py: 1.5 }}
      >
        {isLoading ? (
          <Box className="flex items-center gap-2">
            <CircularProgress color="inherit" size={20} />
            Criando conta...
          </Box>
        ) : (
          "Criar Conta"
        )}
      </Button>
    </Box>

    {/* Sign In Link */}
    <Box className="flex flex-col items-center gap-1 mt-4">
      <Typography variant="body2" className="text-gray-600">
        Escolher outros{" "}
        <Link
          href="/plans"
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Planos
        </Link>
      </Typography>
    </Box>
  </>
);

// =============================================
// CANDIDATE SIGN UP FORM
// =============================================

interface CandidateSignUpFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<FormSignUpCandidateData, any, any>;
  onSubmit: (values: FormSignUpCandidateData) => Promise<void>;
  userType: typeof UserType.CANDIDATE;
  isLoading?: boolean;
  errorMessage?: string;
  successMessage?: string;
}

export const CandidateSignUpForm = ({
  form,
  onSubmit,
  isLoading = false,
  errorMessage,
  successMessage,
}: CandidateSignUpFormProps) => {
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            {...field}
          />
        )}
      />

      <FormFooter isLoading={isLoading} />
    </form>
  );
};

// =============================================
// COMPANY SIGN UP FORM
// =============================================

interface CompanySignUpFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<FormSignUpCompanyData, any, any>;
  onSubmit: (values: FormSignUpCompanyData) => Promise<void>;
  userType: typeof UserType.COMPANY;
  isLoading?: boolean;
  errorMessage?: string;
  successMessage?: string;
}

export const CompanySignUpForm = ({
  form,
  onSubmit,
  isLoading = false,
  errorMessage,
  successMessage,
}: CompanySignUpFormProps) => {
  const companyName = form.watch("companyName");

  // Auto-gerar domain baseado no nome da empresa
  useEffect(() => {
    if (companyName?.trim()) {
      const domain = companyName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/^-+|-+$/g, "");

      form.setValue("domain", domain, { shouldValidate: true });
    }
  }, [companyName, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
      <StatusMessages
        errorMessage={errorMessage}
        successMessage={successMessage}
      />

      {/* Nome da Empresa */}
      <Controller
        control={form.control}
        name="companyName"
        render={({ field }) => (
          <TextField
            fullWidth
            type="text"
            margin="normal"
            label="Nome da Empresa"
            placeholder="Ex: Minha Empresa LTDA"
            disabled={isLoading}
            helperText={form.formState.errors.companyName?.message}
            error={!!form.formState.errors.companyName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon color="action" />
                </InputAdornment>
              ),
            }}
            {...field}
          />
        )}
      />

      {/* Domínio (auto-gerado) */}
      <Controller
        control={form.control}
        name="domain"
        render={({ field }) => (
          <TextField
            fullWidth
            type="text"
            margin="normal"
            label="Domínio da Empresa"
            placeholder="minha-empresa"
            disabled={isLoading}
            helperText={
              form.formState.errors.domain?.message ||
              "Este será o identificador único da sua empresa no sistema"
            }
            error={!!form.formState.errors.domain}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon color="action" />
                </InputAdornment>
              ),
            }}
            {...field}
          />
        )}
      />

      {/* Nome do Contato */}
      <Controller
        control={form.control}
        name="contactName"
        render={({ field }) => (
          <TextField
            fullWidth
            type="text"
            margin="normal"
            label="Nome do Responsável"
            placeholder="Seu nome completo"
            disabled={isLoading}
            helperText={form.formState.errors.contactName?.message}
            error={!!form.formState.errors.contactName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
            {...field}
          />
        )}
      />

      {/* Email do Contato */}
      <Controller
        control={form.control}
        name="contactEmail"
        render={({ field }) => (
          <TextField
            fullWidth
            margin="normal"
            type="email"
            label="Email Corporativo"
            placeholder="contato@empresa.com"
            disabled={isLoading}
            helperText={form.formState.errors.contactEmail?.message}
            error={!!form.formState.errors.contactEmail}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            {...field}
          />
        )}
      />

      <FormFooter isLoading={isLoading} />
    </form>
  );
};

// =============================================
// UNIFIED SIGN UP FORM (wrapper component)
// =============================================

export type SignUpFormProps = CandidateSignUpFormProps | CompanySignUpFormProps;

export const SignUpForm = (props: SignUpFormProps) => {
  if (props.userType === UserType.CANDIDATE) {
    return <CandidateSignUpForm {...(props as CandidateSignUpFormProps)} />;
  }
  return <CompanySignUpForm {...(props as CompanySignUpFormProps)} />;
};
