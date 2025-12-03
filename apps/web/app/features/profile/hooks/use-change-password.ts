"use client";

import { useMutation } from "@tanstack/react-query";
import { getCookie } from "cookies-next";

import { APP_CONSTANTS } from "@/app/libs/constants";
import {
  changePasswordAction,
  ChangePasswordActionState,
} from "../actions/change-password";
import { ChangePasswordInput } from "../schemas/change-password";

interface UseChangePasswordOptions {
  onSuccess?: (data: ChangePasswordActionState) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for password change with React Query
 * Handles form submission with validation and API call
 */
export function useChangePassword(options?: UseChangePasswordOptions) {
  return useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN);

      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      return changePasswordAction(
        data.currentPassword,
        data.newPassword,
        data.confirmPassword,
        token as string
      );
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
