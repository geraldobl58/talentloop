"use server";

import { HTTPError } from "ky";

import { changePasswordSchema } from "../schemas/change-password";

import { changePassword } from "../http/change-password";

export type ChangePasswordActionState = {
  success: boolean;
  message?: string;
};

/**
 * Server Action to change user password
 * Validates form data and sends to API
 * @param currentPassword - The current password
 * @param newPassword - The new password
 * @param token - Authorization token from client
 * @returns Result with success/error message
 */
export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
  token: string
): Promise<ChangePasswordActionState> {
  try {
    // Validate form data using schema
    const validatedData = changePasswordSchema.parse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    console.log("[ChangePassword Debug] Changing password for user");

    // Call the API to change password with token
    const response = await changePassword(
      validatedData.currentPassword,
      validatedData.newPassword,
      token
    );

    if (!response.success) {
      console.error("[ChangePassword API Error]", {
        message: "Failed to change password",
      });

      return {
        success: false,
        message: "Falha ao alterar senha. Tente novamente.",
      };
    }

    return {
      success: true,
      message: response.message || "Senha alterada com sucesso",
    };
  } catch (error) {
    console.error("[ChangePassword Action Error]", error);

    // Handle validation errors
    if (error instanceof Error && "errors" in error) {
      const validationError = error as { errors?: { message?: string }[] };
      return {
        success: false,
        message:
          validationError.errors?.[0]?.message ||
          "Dados inválidos. Verifique os campos.",
      };
    }

    // Handle HTTP errors from API
    if (error instanceof HTTPError) {
      try {
        const errorData = (await error.response.json()) as {
          message?: string;
        };
        return {
          success: false,
          message:
            errorData.message || "Erro ao alterar senha. Tente novamente.",
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
      message: "Erro inesperado ao alterar senha. Tente novamente mais tarde.",
    };
  }
}
