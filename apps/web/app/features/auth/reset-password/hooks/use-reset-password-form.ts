"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { resetPassword } from "../http";
import {
  FormResetPasswordData,
  formResetPasswordSchema,
} from "../schemas/reset-password";
import { APP_CONSTANTS } from "@/app/libs/constants";

/**
 * Hook para gerenciar o formulário de Reset Password com React Query
 */
export const useResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get token from URL search params
  const token = useMemo(() => {
    return searchParams.get("token") || "";
  }, [searchParams]);

  const form = useForm<FormResetPasswordData>({
    resolver: zodResolver(formResetPasswordSchema),
    defaultValues: {
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormResetPasswordData) => {
      return resetPassword({
        token: token || data.token || "",
        newPassword: data.newPassword,
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        // Redirecionar para login
        setTimeout(() => {
          router.push(APP_CONSTANTS.ROUTES.SIGN_IN);
        }, APP_CONSTANTS.REDIRECT.AFTER_RESET_PASSWORD_MS);
      }
    },
  });

  const onSubmit = async (values: FormResetPasswordData) => {
    mutation.mutate(values);
  };

  return {
    form,
    onSubmit,
    token,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess && mutation.data?.success,
    isError: mutation.isError || (mutation.data && !mutation.data.success),
    errorMessage:
      mutation.error?.message ||
      (mutation.data && !mutation.data.success
        ? mutation.data.message
        : undefined),
    successMessage: mutation.data?.success ? mutation.data.message : undefined,
  };
};
