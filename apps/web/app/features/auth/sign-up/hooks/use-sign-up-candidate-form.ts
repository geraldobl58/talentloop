"use client";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import {
  FormSignUpCandidateData,
  formSignUpCandidateSchema,
} from "../schemas/sign-up";

import { UserType } from "../types/user-types";

import {
  CandidatePlanType,
  DEFAULT_CANDIDATE_PLAN,
} from "../../../../libs/plans-data";

import { signUpCandidate } from "../http";

import { APP_CONSTANTS } from "@/app/libs/constants";

export const useSignUpCandidateForm = (
  selectedPlan?: CandidatePlanType | null
) => {
  const router = useRouter();
  const plan = selectedPlan || DEFAULT_CANDIDATE_PLAN;

  const form = useForm<FormSignUpCandidateData>({
    resolver: zodResolver(formSignUpCandidateSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormSignUpCandidateData) => {
      return signUpCandidate({
        name: values.name,
        email: values.email,
        plan,
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        } else if (response.isFree || response.token) {
          setTimeout(() => {
            router.push(APP_CONSTANTS.ROUTES.SIGN_IN);
          }, APP_CONSTANTS.REDIRECT.AFTER_SIGNUP_MS);
        }
      }
    },
  });

  const onSubmit = (values: FormSignUpCandidateData) => {
    mutation.mutate(values);
  };

  const getSuccessMessage = () => {
    if (mutation.isSuccess && mutation.data?.success) {
      if (mutation.data.checkoutUrl) {
        return "Redirecionando para pagamento...";
      }
      return "Conta criada com sucesso! Verifique seu email para obter suas credenciais.";
    }
    return undefined;
  };

  const getErrorMessage = () => {
    if (mutation.isError) {
      return "Erro inesperado. Tente novamente mais tarde.";
    }
    if (mutation.data && !mutation.data.success) {
      return mutation.data.message || "Erro ao criar conta. Tente novamente.";
    }
    return undefined;
  };

  return {
    form,
    onSubmit,
    isLoading: mutation.isPending,
    errorMessage: getErrorMessage(),
    successMessage: getSuccessMessage(),
    userType: UserType.CANDIDATE as const,
  };
};
