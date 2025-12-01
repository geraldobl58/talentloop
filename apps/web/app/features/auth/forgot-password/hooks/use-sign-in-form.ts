"use client";

import { useCallback, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ForgotPasswordAction } from "../actions";
import {
  FormForgotPasswordData,
  formForgotPasswordSchema,
} from "../schemas/forgot-password";

/**
 * Hook para gerenciar o formulário de Forgot Password
 * O tenant é detectado automaticamente pelo backend através do email
 */
export const useForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const form = useForm<FormForgotPasswordData>({
    resolver: zodResolver(formForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = useCallback(
    async (values: FormForgotPasswordData) => {
      setIsLoading(true);
      setErrorMessage(undefined);
      setSuccessMessage(undefined);

      try {
        // Converter valores para FormData para a server action
        const formData = new FormData();
        formData.append("email", values.email);

        const response = await ForgotPasswordAction(formData);

        if (response.success) {
          setSuccessMessage(
            response.message ||
              "Se o email existir em nossa base, você receberá instruções para redefinir sua senha."
          );
          // Limpar o formulário após sucesso
          form.reset();
        } else {
          setErrorMessage(
            response.message ||
              "Erro ao solicitar redefinição de senha. Tente novamente."
          );

          // Display validation errors
          if (response.errors) {
            Object.entries(response.errors).forEach(([field, errors]) => {
              form.setError(field as keyof FormForgotPasswordData, {
                type: "manual",
                message: errors?.[0] || "Erro de validação",
              });
            });
          }
        }
      } catch (error) {
        console.error("ForgotPassword error:", error);
        setErrorMessage("Erro inesperado. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    },
    [form]
  );

  return {
    form,
    onSubmit,
    isLoading,
    errorMessage,
    successMessage,
  };
};
