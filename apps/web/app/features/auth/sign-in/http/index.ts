import { HTTPError } from "ky";

import { api } from "@/app/libs/api-client";

import {
  SignInRequest,
  SignInResponse,
  SignInApiResponse,
  RefreshTokenApiResponse,
  RefreshTokenResponse,
} from "../types/user-type";

/**
 * Realiza o signin unificado
 * O sistema detecta automaticamente se é candidato ou empresa pelo email
 */
export async function signIn(data: SignInRequest): Promise<SignInResponse> {
  try {
    const response = await api
      .post("auth/signin", {
        json: {
          email: data.email,
          password: data.password,
          ...(data.twoFactorToken && { twoFactorToken: data.twoFactorToken }),
        },
      })
      .json<SignInApiResponse>();

    return {
      success: true,
      message: response.message || "Login realizado com sucesso",
      token: response.access_token,
      requiresTwoFactor: response.requiresTwoFactor,
      tenantType: response.tenantType,
      userId: response.userId,
      user: response.user,
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      throw error;
    }
    throw error;
  }
}

/**
 * Refresh do access token
 * Requer que o usuário esteja autenticado (token atual ainda válido)
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
  try {
    const response = await api
      .post("auth/refresh")
      .json<RefreshTokenApiResponse>();

    return {
      success: true,
      token: response.access_token,
      tenantType: response.tenantType,
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      const errorData = (await error.response.json().catch(() => ({}))) as {
        message?: string;
      };
      return {
        success: false,
        message: errorData.message || "Sessão expirada. Faça login novamente.",
      };
    }
    return {
      success: false,
      message: "Erro ao renovar sessão.",
    };
  }
}
