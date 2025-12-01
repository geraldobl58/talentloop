"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { forgotPassword } from "../http";
import {
  FormForgotPasswordData,
  formForgotPasswordSchema,
} from "../schemas/forgot-password";

/**
 * Hook para gerenciar o formulário de Forgot Password com React Query
 * O tenant é detectado automaticamente pelo backend através do email
 */
export const useForgotPasswordForm = () => {
  const form = useForm<FormForgotPasswordData>({
    resolver: zodResolver(formForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormForgotPasswordData) => {
      return forgotPassword({ email: data.email });
    },
    onSuccess: () => {
      form.reset();
    },
  });

  const onSubmit = async (values: FormForgotPasswordData) => {
    mutation.mutate(values);
  };

  return {
    form,
    onSubmit,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    errorMessage:
      mutation.error?.message ||
      (mutation.data && !mutation.data.success
        ? mutation.data.message
        : undefined),
    successMessage: mutation.data?.success ? mutation.data.message : undefined,
  };
};
