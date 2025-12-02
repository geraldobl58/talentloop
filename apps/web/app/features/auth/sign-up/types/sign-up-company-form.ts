import { UseFormReturn } from "react-hook-form";

import { FormSignUpCompanyData } from "../schemas/sign-up";

import { UserType } from "./user-types";

export interface SignUpCompanyFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<FormSignUpCompanyData, any, any>;
  onSubmit: (values: FormSignUpCompanyData) => void | Promise<void>;
  userType: typeof UserType.COMPANY;
  isLoading?: boolean;
  errorMessage?: string;
  successMessage?: string;
}
