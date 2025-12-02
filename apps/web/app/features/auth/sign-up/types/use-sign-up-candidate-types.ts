import { UseFormReturn } from "react-hook-form";

import { FormSignUpCandidateData } from "../schemas/sign-up";
import { UserType } from "./user-types";

export interface CandidateFormReturn {
  form: UseFormReturn<FormSignUpCandidateData>;
  onSubmit: (values: FormSignUpCandidateData) => void;
  isLoading: boolean;
  errorMessage?: string;
  successMessage?: string;
  userType: typeof UserType.CANDIDATE;
}
