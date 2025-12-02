import { UserType } from "../types/user-types";

import { SignUpCompanyForm } from "./sign-up-company-form";
import { SignUpCompanyFormProps } from "../types/sign-up-company-form";
import { SignUpCandidateForm } from "./sign-up-candidate-form";
import { SignUpCandidateFormProps } from "../types/sign-up-candidate-form";

export type SignUpFormProps = SignUpCandidateFormProps | SignUpCompanyFormProps;

export const SignUpForm = (props: SignUpFormProps) => {
  if (props.userType === UserType.CANDIDATE) {
    return <SignUpCandidateForm {...(props as SignUpCandidateFormProps)} />;
  }
  return <SignUpCompanyForm {...(props as SignUpCompanyFormProps)} />;
};
