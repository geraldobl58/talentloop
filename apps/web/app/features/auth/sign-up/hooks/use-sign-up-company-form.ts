"use client";

import { useRouter } from "next/navigation";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import {
  FormSignUpCandidateData,
  FormSignUpCompanyData,
  formSignUpCompanySchema,
} from "../schemas/sign-up";
import { UserType } from "../types/user-types";
import {
  CompanyPlanType,
  DEFAULT_COMPANY_PLAN,
} from "../../../../libs/plans-data";
import { signUpCompany } from "../http";
import { APP_CONSTANTS } from "@/app/libs/constants";

export const useSignUpCompanyForm = (selectedPlan?: CompanyPlanType | null) => {
  const router = useRouter();
  const plan = selectedPlan || DEFAULT_COMPANY_PLAN;

  const form = useForm<FormSignUpCompanyData>({
    resolver: zodResolver(formSignUpCompanySchema),
    defaultValues: {
      companyName: "",
      domain: "",
      contactName: "",
      contactEmail: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormSignUpCompanyData) => {
      return signUpCompany({
        companyName: values.companyName,
        domain: values.domain,
        contactName: values.contactName,
        contactEmail: values.contactEmail,
        plan,
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        } else if (response.token || response.tenantId) {
          setTimeout(() => {
            router.push(APP_CONSTANTS.ROUTES.SIGN_IN);
          }, APP_CONSTANTS.REDIRECT.AFTER_SIGNUP_MS);
        }
      }
    },
  });

  const onSubmit = (values: FormSignUpCompanyData) => {
    mutation.mutate(values);
  };

  // Determine success message
  const getSuccessMessage = () => {
    if (mutation.isSuccess && mutation.data?.success) {
      if (mutation.data.checkoutUrl) {
        return "Redirecionando para pagamento...";
      }
      return "Conta criada com sucesso! Verifique seu email para obter suas credenciais.";
    }
    return undefined;
  };

  // Determine error message
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
    userType: UserType.COMPANY as const,
  };
};
