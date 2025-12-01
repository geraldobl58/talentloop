"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { setCookie } from "cookies-next";
import { HTTPError } from "ky";

import { FormSignInData, formSignInSchema } from "../schemas";
import { signIn } from "../http";
import { TenantType } from "../types";

/**
 * Hook para gerenciar o formulário de signin unificado com React Query
 * O tipo de usuário (CANDIDATE ou COMPANY) é detectado automaticamente pelo backend
 */
export const useSignInForm = () => {
  const router = useRouter();
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  const form = useForm<FormSignInData>({
    resolver: zodResolver(formSignInSchema),
    defaultValues: {
      email: "",
      password: "",
      twoFactorToken: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormSignInData) => {
      return signIn({
        email: values.email,
        password: values.password,
        twoFactorToken: values.twoFactorToken,
      });
    },
    onSuccess: (response, variables) => {
      // Se requer 2FA e ainda não foi enviado o código
      if (response.requiresTwoFactor && !variables.twoFactorToken) {
        setRequiresTwoFactor(true);
        return;
      }

      // Se 2FA foi verificado com sucesso ou não é necessário, salvar token
      if (response.token) {
        // Store token in cookie
        setCookie("access_token", response.token, {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        // Store tenant type from API
        const tenantType: TenantType = response.tenantType || "CANDIDATE";
        setCookie("tenant_type", tenantType, {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        const errorData = (await error.response.json().catch(() => ({}))) as {
          message?: string;
          errors?: Record<string, string[]>;
        };

        // Display validation errors
        if (errorData.errors) {
          Object.entries(errorData.errors).forEach(([field, errors]) => {
            form.setError(field as keyof FormSignInData, {
              type: "manual",
              message: errors?.[0] || "Erro de validação",
            });
          });
        }
      }
    },
  });

  const onSubmit = async (values: FormSignInData) => {
    mutation.mutate(values);
  };

  // Determine success message
  const getSuccessMessage = () => {
    if (mutation.isSuccess) {
      if (requiresTwoFactor && !form.getValues("twoFactorToken")) {
        return "Digite o código de autenticação de dois fatores";
      }
      return "Login realizado com sucesso! Redirecionando...";
    }
    return undefined;
  };

  return {
    form,
    onSubmit,
    isLoading: mutation.isPending,
    errorMessage: mutation.error
      ? mutation.error instanceof HTTPError
        ? "Erro ao realizar login. Tente novamente."
        : "Erro inesperado. Tente novamente mais tarde."
      : undefined,
    successMessage: getSuccessMessage(),
    requiresTwoFactor,
  };
};
