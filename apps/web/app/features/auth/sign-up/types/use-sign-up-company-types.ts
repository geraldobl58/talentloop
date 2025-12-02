import { UseFormReturn } from "react-hook-form";

import { FormSignUpCompanyData } from "../schemas/sign-up";

import { UserType } from "./user-types";

export interface CompanyFormReturn {
  form: UseFormReturn<FormSignUpCompanyData>;
  onSubmit: (values: FormSignUpCompanyData) => void;
  isLoading: boolean;
  errorMessage?: string;
  successMessage?: string;
  userType: typeof UserType.COMPANY;
}
