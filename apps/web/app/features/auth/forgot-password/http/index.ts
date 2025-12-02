import { HTTPError } from "ky";

import { api } from "@/app/libs/api-client";

import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ForgotPasswordApiResponse,
} from "../types/forgot-password";

/**
 * Solicita reset de senha
 * O sistema detecta automaticamente o tenant pelo email
 */
export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  try {
    const response = await api
      .post("auth/forgot-password", {
        json: {
          email: data.email,
        },
      })
      .json<ForgotPasswordApiResponse>();

    return {
      success: response.success ?? true,
      message:
        response.message ||
        "Se o email existir em nossa base, você receberá instruções para redefinir sua senha.",
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      const errorData = (await error.response.json().catch(() => ({}))) as {
        message?: string;
      };
      return {
        success: false,
        message: errorData.message || "Erro ao solicitar redefinição de senha.",
      };
    }
    throw error;
  }
}
