import { HTTPError } from "ky";

import { api } from "@/app/libs/api-client";
import {
  ResetPasswordRequest,
  ResetPasswordResponse,
  ResetPasswordApiResponse,
} from "../types";

/**
 * Envia requisição de redefinição de senha
 * @param data - Dados da requisição (token e newPassword)
 * @returns Promise com dados de resposta incluindo mensagem de sucesso/erro
 */
export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  try {
    const response = await api
      .post("auth/reset-password", {
        json: {
          token: data.token,
          newPassword: data.newPassword,
        },
      })
      .json<ResetPasswordApiResponse>();

    return {
      success: response.success ?? true,
      message: response.message || "Senha redefinida com sucesso",
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      const errorData = (await error.response.json().catch(() => ({}))) as {
        message?: string;
      };
      return {
        success: false,
        message:
          errorData.message ||
          "Erro ao redefinir senha. Verifique se o link é válido.",
      };
    }
    throw error;
  }
}
