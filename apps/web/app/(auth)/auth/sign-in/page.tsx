"use client";

import { useState } from "react";
import { Box } from "@mui/material";

import {
  AuthContainer,
  AuthTabs,
  AuthTabPanel,
  SignInForm,
} from "@/app/features/auth/sign-in/components";
import { useSignInForm } from "@/app/features/auth/sign-in/hooks";
import { UserType } from "@/app/features/auth/sign-in/types";

const AuthSignInPage = () => {
  const [userType, setUserType] = useState<UserType>(UserType.CANDIDATE);

  const {
    form,
    onSubmit,
    isLoading,
    errorMessage,
    successMessage,
    requiresTwoFactor,
  } = useSignInForm({ userType });

  const handleTabChange = (newUserType: UserType) => {
    setUserType(newUserType);
  };

  return (
    <AuthContainer>
      <AuthTabs value={userType} onChange={handleTabChange}>
        <AuthTabPanel value={UserType.CANDIDATE}>
          <Box>
            <SignInForm
              form={form}
              onSubmit={onSubmit}
              userType={UserType.CANDIDATE}
              isLoading={isLoading}
              errorMessage={errorMessage}
              successMessage={successMessage}
              requiresTwoFactor={requiresTwoFactor}
            />
          </Box>
        </AuthTabPanel>
        <AuthTabPanel value={UserType.COMPANY}>
          <Box>
            <SignInForm
              form={form}
              onSubmit={onSubmit}
              userType={UserType.COMPANY}
              isLoading={isLoading}
              errorMessage={errorMessage}
              successMessage={successMessage}
              requiresTwoFactor={requiresTwoFactor}
            />
          </Box>
        </AuthTabPanel>
      </AuthTabs>
    </AuthContainer>
  );
};

export default AuthSignInPage;
