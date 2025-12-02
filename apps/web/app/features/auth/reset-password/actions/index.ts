"use server";

import { HTTPError } from "ky";
import { formResetPasswordSchema } from "../schemas/reset-password";
import { resetPassword } from "../http";

export type ResetPasswordActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]> | null;
};

/**
 * Server Action para enviar requisicao de redefinicao de senha
 * @param formData - FormData contendo dados de redefinicao (token, newPassword, confirmPassword)
 * @returns Resultado da acao com status de sucesso/erro
 */
export async function resetPasswordAction(
  formData: FormData
): Promise<ResetPasswordActionState> {
  try {
    // Parse e validacao dos dados
    const rawData = Object.fromEntries(formData);
    const validationResult = formResetPasswordSchema.safeParse(rawData);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Validacao falhou. Verifique os campos.",
        errors: fieldErrors,
      };
    }

    const formData_ = validationResult.data;

    // Chamada a API
    const response = await resetPassword({
      token: formData_.token || "",
      newPassword: formData_.newPassword,
    });

    // Verificar se a requisicao foi bem-sucedida
    if (!response.success) {
      return {
        success: false,
        message: response.message || "Erro ao redefinir senha",
      };
    }

    // Retornar resposta com mensagem de sucesso
    return {
      success: true,
      message:
        response.message ||
        "Senha redefinida com sucesso. Voce sera redirecionado para o login.",
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      try {
        const errorData = (await error.response.json()) as { message?: string };
        return {
          success: false,
          message:
            errorData.message || "Erro ao conectar com a API. Tente novamente.",
        };
      } catch {
        return {
          success: false,
          message: "Erro ao processar resposta do servidor.",
        };
      }
    }

    return {
      success: false,
      message: "Erro inesperado. Tente novamente mais tarde.",
    };
  }
}
