"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
} from "../components/plans-data";
import { signUpCandidateAction, signUpCompanyAction } from "../actions";

// =============================================
// TYPES
// =============================================

interface UseSignUpFormOptions {
  userType: UserType;
}

interface CandidateFormReturn {
  form: UseFormReturn<FormSignUpCandidateData>;
  onSubmit: (values: FormSignUpCandidateData) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string;
  successMessage?: string;
  userType: typeof UserType.CANDIDATE;
}

interface CompanyFormReturn {
  form: UseFormReturn<FormSignUpCompanyData>;
  onSubmit: (values: FormSignUpCompanyData) => Promise<void>;
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

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const form = useForm<FormSignUpCandidateData>({
    resolver: zodResolver(formSignUpCandidateSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = useCallback(
    async (values: FormSignUpCandidateData) => {
      setIsLoading(true);
      setErrorMessage(undefined);
      setSuccessMessage(undefined);

      try {
        // Build FormData with all fields including plan
        const fd = new FormData();
        fd.append("name", values.name);
        fd.append("email", values.email);
        fd.append("plan", plan);

        const response = await signUpCandidateAction(fd);

        if (response.success) {
          if (response.checkoutUrl) {
            setSuccessMessage("Redirecionando para pagamento...");
            window.location.href = response.checkoutUrl;
          } else if (response.isFree || response.token) {
            setSuccessMessage(
              "Conta criada com sucesso! Verifique seu email para obter suas credenciais."
            );
            setTimeout(() => {
              router.push("/auth/sign-in");
            }, 2000);
          }
        } else {
          setErrorMessage(
            response.message || "Erro ao criar conta. Tente novamente."
          );
        }
      } catch (error) {
        console.error("SignUp error:", error);
        setErrorMessage("Erro inesperado. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    },
    [router, plan]
  );

  return {
    form,
    onSubmit,
    isLoading,
    errorMessage,
    successMessage,
    userType: UserType.CANDIDATE as const,
  };
};

// =============================================
// COMPANY HOOK
// =============================================

export const useSignUpCompanyForm = (selectedPlan?: PlanType | null) => {
  const router = useRouter();
  const plan = selectedPlan || DEFAULT_COMPANY_PLAN;

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  const form = useForm<FormSignUpCompanyData>({
    resolver: zodResolver(formSignUpCompanySchema),
    defaultValues: {
      companyName: "",
      domain: "",
      contactName: "",
      contactEmail: "",
    },
  });

  const onSubmit = useCallback(
    async (values: FormSignUpCompanyData) => {
      setIsLoading(true);
      setErrorMessage(undefined);
      setSuccessMessage(undefined);

      try {
        // Build FormData with all fields including plan
        const fd = new FormData();
        fd.append("companyName", values.companyName);
        fd.append("domain", values.domain);
        fd.append("contactName", values.contactName);
        fd.append("contactEmail", values.contactEmail);
        fd.append("plan", plan);

        const response = await signUpCompanyAction(fd);

        if (response.success) {
          if (response.checkoutUrl) {
            setSuccessMessage("Redirecionando para pagamento...");
            window.location.href = response.checkoutUrl;
          } else if (response.token || response.tenantId) {
            setSuccessMessage(
              "Conta criada com sucesso! Verifique seu email para obter suas credenciais."
            );
            setTimeout(() => {
              router.push("/auth/sign-in");
            }, 2000);
          }
        } else {
          setErrorMessage(
            response.message || "Erro ao criar conta. Tente novamente."
          );
        }
      } catch (error) {
        console.error("SignUp error:", error);
        setErrorMessage("Erro inesperado. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    },
    [router, plan]
  );

  return {
    form,
    onSubmit,
    isLoading,
    errorMessage,
    successMessage,
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
