"use client";

import { useEffect } from "react";

import { UserType } from "../types/user-types";

import { useSignUpCandidateForm } from "./use-sign-up-candidate-form";
import { useSignUpCompanyForm } from "./use-sign-up-company-form";

import { CandidateFormReturn } from "../types/use-sign-up-candidate-types";
import { CompanyFormReturn } from "../types/use-sign-up-company-types";
interface UseSignUpFormOptions {
  userType: UserType;
}

export type UseSignUpFormReturn = CandidateFormReturn | CompanyFormReturn;

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
