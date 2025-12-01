"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setCookie } from "cookies-next";

import { FormSignInData, formSignInSchema } from "../schemas";
import { signInAction } from "../actions";
import { TenantType } from "../types";

/**
 * Hook para gerenciar o formulário de signin unificado
 * O tipo de usuário (CANDIDATE ou COMPANY) é detectado automaticamente pelo backend
 */
export const useSignInForm = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  const form = useForm<FormSignInData>({
    resolver: zodResolver(formSignInSchema),
    defaultValues: {
      email: "",
      password: "",
      twoFactorToken: "",
    },
  });

  const onSubmit = useCallback(
    async (values: FormSignInData) => {
      setIsLoading(true);
      setErrorMessage(undefined);
      setSuccessMessage(undefined);

      try {
        // Converter valores para FormData para a server action
        const formData = new FormData();
        formData.append("email", values.email);
        formData.append("password", values.password);
        if (values.twoFactorToken) {
          formData.append("twoFactorToken", values.twoFactorToken);
        }

        const response = await signInAction(formData);

        if (response.success) {
          // Se requer 2FA e ainda não foi enviado o código
          if (response.requiresTwoFactor && !values.twoFactorToken) {
            setRequiresTwoFactor(true);
            setSuccessMessage(
              "Digite o código de autenticação de dois fatores"
            );
            setIsLoading(false);
            return;
          }

          // Se 2FA foi verificado com sucesso ou não é necessário, salvar token
          if (response.token) {
            // Store token in cookie (for Server Actions and client-side API calls)
            setCookie("access_token", response.token, {
              maxAge: 60 * 60 * 24 * 7, // 7 days
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });

            // Store tenant type from API (CANDIDATE or COMPANY) - this ensures data isolation
            // The tenantType comes from the server based on the actual tenant in database
            const tenantType: TenantType = response.tenantType || "CANDIDATE";
            setCookie("tenant_type", tenantType, {
              maxAge: 60 * 60 * 24 * 7, // 7 days
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });

            setSuccessMessage("Login realizado com sucesso! Redirecionando...");
            setTimeout(() => {
              router.push("/dashboard");
            }, 800);
          }
        } else {
          setErrorMessage(
            response.message || "Erro ao realizar login. Tente novamente."
          );

          // Display validation errors
          if (response.errors) {
            Object.entries(response.errors).forEach(([field, errors]) => {
              form.setError(field as keyof FormSignInData, {
                type: "manual",
                message: errors?.[0] || "Erro de validação",
              });
            });
          }
        }
      } catch (error) {
        console.error("SignIn error:", error);
        setErrorMessage("Erro inesperado. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    },
    [router, form]
  );

  return {
    form,
    onSubmit,
    isLoading,
    errorMessage,
    successMessage,
    requiresTwoFactor,
  };
};
