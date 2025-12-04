"use server";

import { HTTPError } from "ky";
import {
  generate2FA,
  enable2FA,
  disable2FA,
  check2FAStatus,
  regenerateBackupCodes,
} from "../http/profile-2fa";

import { enable2FASchema, disable2FASchema } from "../schemas/profile-2fa";

export type Generate2FAActionState = {
  success: boolean;
  message?: string;
  data?: {
    secret: string;
    qrCode: string;
  };
};

export type Enable2FAActionState = {
  success: boolean;
  message?: string;
  data?: {
    backupCodes: string[];
  };
};

export type Disable2FAActionState = {
  success: boolean;
  message?: string;
};

export type Check2FAStatusActionState = {
  success: boolean;
  message?: string;
  data?: {
    twoFactorEnabled: boolean;
  };
};

export type RegenerateBackupCodesActionState = {
  success: boolean;
  message?: string;
  data?: {
    backupCodes: string[];
  };
};

/**
 * Server Action to generate 2FA secret
 * @param token - Authorization token from client
 * @returns Result with secret and QR code or error message
 */
export async function generate2FAAction(
  token: string
): Promise<Generate2FAActionState> {
  try {
    const response = await generate2FA(token);

    if (!response.success) {
      console.error("[Generate2FA API Error]", {
        message: "Failed to generate 2FA",
      });

      return {
        success: false,
        message: "Falha ao gerar código 2FA. Tente novamente.",
      };
    }

    return {
      success: true,
      message: response.message || "Código 2FA gerado com sucesso",
      data: response.data,
    };
  } catch (error) {
    console.error("[Generate2FA Action Error]", error);

    if (error instanceof HTTPError) {
      try {
        const errorData = (await error.response.json()) as {
          message?: string;
        };
        return {
          success: false,
          message:
            errorData.message || "Erro ao gerar código 2FA. Tente novamente.",
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
      message: "Erro inesperado ao gerar código 2FA. Tente novamente.",
    };
  }
}

/**
 * Server Action to enable 2FA
 * @param token - TOTP token (6 digits)
 * @param authToken - Authorization token from client
 * @returns Result with backup codes or error message
 */
export async function enable2FAAction(
  token: string,
  authToken: string
): Promise<Enable2FAActionState> {
  try {
    // Validate token using schema
    const validatedData = enable2FASchema.parse({ token });

    const response = await enable2FA(validatedData.token, authToken);

    if (!response.success) {
      console.error("[Enable2FA API Error]", {
        message: "Failed to enable 2FA",
      });

      return {
        success: false,
        message: "Falha ao ativar 2FA. Tente novamente.",
      };
    }

    return {
      success: true,
      message: response.message || "2FA ativado com sucesso",
      data: response.data,
    };
  } catch (error) {
    console.error("[Enable2FA Action Error]", error);

    // Handle validation errors
    if (error instanceof Error && "errors" in error) {
      const validationError = error as { errors?: Array<{ message: string }> };
      return {
        success: false,
        message:
          validationError.errors?.[0]?.message ||
          "Código inválido. Digite 6 dígitos.",
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
          message: errorData.message || "Erro ao ativar 2FA. Tente novamente.",
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
      message: "Erro inesperado ao ativar 2FA. Tente novamente.",
    };
  }
}

/**
 * Server Action to disable 2FA
 * @param token - TOTP token or backup code (6-8 characters)
 * @param authToken - Authorization token from client
 * @returns Result with success status or error message
 */
export async function disable2FAAction(
  token: string,
  authToken: string
): Promise<Disable2FAActionState> {
  try {
    // Validate token using schema
    const validatedData = disable2FASchema.parse({ token });

    const response = await disable2FA(validatedData.token, authToken);

    if (!response.success) {
      console.error("[Disable2FA API Error]", {
        message: "Failed to disable 2FA",
      });

      return {
        success: false,
        message: "Falha ao desativar 2FA. Tente novamente.",
      };
    }

    return {
      success: true,
      message: response.message || "2FA desativado com sucesso",
    };
  } catch (error) {
    console.error("[Disable2FA Action Error]", error);

    // Handle validation errors
    if (error instanceof Error && "errors" in error) {
      const validationError = error as { errors?: Array<{ message: string }> };
      return {
        success: false,
        message:
          validationError.errors?.[0]?.message ||
          "Código inválido. Digite 6-8 caracteres.",
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
            errorData.message || "Erro ao desativar 2FA. Tente novamente.",
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
      message: "Erro inesperado ao desativar 2FA. Tente novamente.",
    };
  }
}

/**
 * Server Action to check 2FA status
 * @param token - Authorization token from client
 * @returns Result with 2FA status or error message
 */
export async function check2FAStatusAction(
  token: string
): Promise<Check2FAStatusActionState> {
  try {
    const response = await check2FAStatus(token);

    if (!response.success) {
      console.error("[Check2FAStatus API Error]", {
        message: "Failed to check 2FA status",
      });

      return {
        success: false,
        message: "Falha ao verificar status 2FA. Tente novamente.",
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("[Check2FAStatus Action Error]", error);

    if (error instanceof HTTPError) {
      try {
        const errorData = (await error.response.json()) as {
          message?: string;
        };
        return {
          success: false,
          message:
            errorData.message ||
            "Erro ao verificar status 2FA. Tente novamente.",
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
      message: "Erro inesperado ao verificar status 2FA. Tente novamente.",
    };
  }
}

/**
 * Server Action to regenerate backup codes
 * @param twoFactorToken - TOTP token or backup code (6-8 characters)
 * @param authToken - Authorization token from client
 * @returns Result with new backup codes or error message
 */
export async function regenerateBackupCodesAction(
  twoFactorToken: string,
  authToken: string
): Promise<RegenerateBackupCodesActionState> {
  try {
    // Validate token using schema
    const validatedData = disable2FASchema.parse({ token: twoFactorToken });

    const response = await regenerateBackupCodes(
      validatedData.token,
      authToken
    );

    if (!response.success) {
      console.error("[RegenerateBackupCodes API Error]", {
        message: "Failed to regenerate backup codes",
      });

      return {
        success: false,
        message: "Falha ao regenerar códigos de backup. Tente novamente.",
      };
    }

    return {
      success: true,
      message: response.message || "Códigos de backup regenerados com sucesso",
      data: response.data,
    };
  } catch (error) {
    console.error("[RegenerateBackupCodes Action Error]", error);

    // Handle validation errors
    if (error instanceof Error && "errors" in error) {
      const validationError = error as Record<string, unknown>;
      return {
        success: false,
        message:
          (validationError.errors as Array<{ message: string }>)?.[0]
            ?.message || "Código inválido. Digite 6-8 caracteres.",
      };
    }

    if (error instanceof HTTPError) {
      try {
        const errorData = (await error.response.json()) as {
          message?: string;
        };
        return {
          success: false,
          message:
            errorData.message ||
            "Erro ao regenerar códigos de backup. Tente novamente.",
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
      message:
        "Erro inesperado ao regenerar códigos de backup. Tente novamente.",
    };
  }
}
