"use client";

import { useEffect } from "react";

import { Controller } from "react-hook-form";
import { TextField } from "@mui/material";

import { SignUpCompanyFormProps } from "../types/sign-up-company-form";

import { FormFooter } from "./form-footer";
import { StatusMessages } from "@/app/components/status-message";

export const SignUpCompanyForm = ({
  form,
  onSubmit,
  isLoading = false,
  errorMessage,
  successMessage,
}: SignUpCompanyFormProps) => {
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
            disabled={true}
            helperText={
              form.formState.errors.domain?.message ||
              "Este será o identificador único da sua empresa no sistema"
            }
            error={!!form.formState.errors.domain}
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
            {...field}
          />
        )}
      />

      <FormFooter isLoading={isLoading} />
    </form>
  );
};
