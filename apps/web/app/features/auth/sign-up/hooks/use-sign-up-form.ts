"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import {
  FormSignUpCandidateData,
  FormSignUpCompanyData,
  formSignUpCandidateSchema,
  formSignUpCompanySchema,
} from "../schemas";
import { UserType } from "../types";
import {
  PlanType,
  DEFAULT_CANDIDATE_PLAN,
  DEFAULT_COMPANY_PLAN,
} from "../../../../libs/plans-data";
import { signUpCandidate, signUpCompany } from "../http";

// =============================================
// TYPES
// =============================================

interface UseSignUpFormOptions {
  userType: UserType;
}

interface CandidateFormReturn {
  form: UseFormReturn<FormSignUpCandidateData>;
  onSubmit: (values: FormSignUpCandidateData) => void;
  isLoading: boolean;
  errorMessage?: string;
  successMessage?: string;
  userType: typeof UserType.CANDIDATE;
}

interface CompanyFormReturn {
  form: UseFormReturn<FormSignUpCompanyData>;
  onSubmit: (values: FormSignUpCompanyData) => void;
  isLoading: boolean;
  errorMessage?: string;
  successMessage?: string;
  userType: typeof UserType.COMPANY;
}

export type UseSignUpFormReturn = CandidateFormReturn | CompanyFormReturn;

// =============================================
// CANDIDATE HOOK
// =============================================

export const useSignUpCandidateForm = (selectedPlan?: PlanType | null) => {
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
            router.push("/auth/sign-in");
          }, 2000);
        }
      }
    },
  });

  const onSubmit = (values: FormSignUpCandidateData) => {
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
    userType: UserType.CANDIDATE as const,
  };
};

// =============================================
// COMPANY HOOK
// =============================================

export const useSignUpCompanyForm = (selectedPlan?: PlanType | null) => {
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
            router.push("/auth/sign-in");
          }, 2000);
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

// =============================================
// COMBINED HOOK (for backward compatibility)
// =============================================

export const useSignUpForm = ({ userType }: UseSignUpFormOptions) => {
  const candidateForm = useSignUpCandidateForm();
  const companyForm = useSignUpCompanyForm();

  // Reset forms when user type changes
  useEffect(() => {
    candidateForm.form.reset();
    companyForm.form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userType]);

  if (userType === UserType.CANDIDATE) {
    return candidateForm;
  }

  return companyForm;
};
