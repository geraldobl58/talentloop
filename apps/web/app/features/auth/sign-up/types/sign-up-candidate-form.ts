import { UseFormReturn } from "react-hook-form";

import { FormSignUpCandidateData } from "../schemas/sign-up";

import { UserType } from "./user-types";

export interface SignUpCandidateFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<FormSignUpCandidateData, any, any>;
  onSubmit: (values: FormSignUpCandidateData) => void | Promise<void>;
  userType: typeof UserType.CANDIDATE;
  isLoading?: boolean;
  errorMessage?: string;
  successMessage?: string;
}
