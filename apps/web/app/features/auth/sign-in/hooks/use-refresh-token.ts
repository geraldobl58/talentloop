"use client";

import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { setCookie, deleteCookie } from "cookies-next";

import { APP_CONSTANTS } from "@/app/libs/constants";
import { refreshToken } from "../http";
import { RefreshTokenResponse } from "../types/user-type";

interface UseRefreshTokenOptions {
  onSuccess?: (data: RefreshTokenResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook para refresh do token de acesso
 */
export function useRefreshToken(options?: UseRefreshTokenOptions) {
  const mutation = useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      if (data.success && data.token) {
        // Atualiza o cookie com o novo token
        setCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN, data.token, {
          maxAge: APP_CONSTANTS.AUTH.TOKEN_MAX_AGE_SECONDS,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        // Atualiza o tenant type se retornado
        if (data.tenantType) {
          setCookie(APP_CONSTANTS.COOKIES.TENANT_TYPE, data.tenantType, {
            maxAge: APP_CONSTANTS.AUTH.TOKEN_MAX_AGE_SECONDS,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          });
        }

        options?.onSuccess?.(data);
      } else {
        // Token inválido - limpar cookies e redirecionar
        deleteCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN);
        deleteCookie(APP_CONSTANTS.COOKIES.TENANT_TYPE);
        options?.onError?.(new Error(data.message || "Sessão expirada"));
      }
    },
    onError: (error) => {
      // Token inválido - limpar cookies
      deleteCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN);
      deleteCookie(APP_CONSTANTS.COOKIES.TENANT_TYPE);
      options?.onError?.(error);
    },
  });

  const refresh = useCallback(() => {
    return mutation.mutateAsync();
  }, [mutation]);

  return {
    refresh,
    isRefreshing: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
