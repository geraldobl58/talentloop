"use server";

import { HTTPError } from "ky";
import { formForgotPasswordSchema } from "../schemas/forgot-password";
import { forgotPassword } from "../http";

export type ForgotPasswordActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]> | null;
};

/**
 * Server Action para solicitar reset de senha
 * O sistema detecta automaticamente o tenant pelo email
 * @param formData - FormData contendo o email
 * @returns Resultado da ação com status de sucesso/erro
 */
export async function ForgotPasswordAction(
  formData: FormData
): Promise<ForgotPasswordActionState> {
  try {
    // Parse e validação dos dados
    const rawData = Object.fromEntries(formData);
    const validationResult = formForgotPasswordSchema.safeParse(rawData);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Validação falhou. Verifique os campos.",
        errors: fieldErrors,
      };
    }

    const validatedData = validationResult.data;

    // Chamar API de forgot password
    const response = await forgotPassword({
      email: validatedData.email,
    });

    return {
      success: response.success,
      message: response.message,
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
