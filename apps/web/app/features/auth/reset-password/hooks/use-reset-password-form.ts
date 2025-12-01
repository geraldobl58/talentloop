"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { resetPassword } from "../http";
import { FormResetPasswordData, formResetPasswordSchema } from "../schemas";

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
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 2000);
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
