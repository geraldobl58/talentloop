import { HTTPError } from "ky";

import { api } from "@/app/libs/api-client";

import { SignInRequest, SignInResponse, SignInApiResponse } from "../types";

/**
 * Realiza o signin do usuário
 * Usa uma instância de ky sem autenticação pois signin não requer token pré-existente
 * @param data - Dados de signin do usuário
 * @returns Promise com dados de resposta do signin incluindo token
 * @throws HTTPError se a requisição falhar
 */
export async function signIn(data: SignInRequest): Promise<SignInResponse> {
  try {
    const response = await api
      .post("auth/signin", {
        json: {
          email: data.email,
          password: data.password,
          tenantId: data.tenantId,
          ...(data.twoFactorToken && { twoFactorToken: data.twoFactorToken }),
        },
      })
      .json<SignInApiResponse>();

    // Transformar resposta da API para o formato esperado
    return {
      success: true,
      message: response.message || "Login realizado com sucesso",
      token: response.access_token,
      requiresTwoFactor: response.requiresTwoFactor,
      tenantType: response.tenantType, // Include tenant type from API
      userId: response.userId,
      user: response.user,
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      try {
        (await error.response.json()) as Record<string, unknown>;
        throw error;
      } catch {
        console.error(
          "[signIn] Não foi possível parsear erro:",
          error.response
        );
        throw error;
      }
    }

    throw error;
  }
}
