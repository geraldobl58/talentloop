"use server";

import { HTTPError } from "ky";

import { avatarUploadSchema } from "../schemas/upload-avatar";

import { uploadAvatar } from "../hooks/upload-avatar";

export type UploadAvatarActionState = {
  success: boolean;
  message?: string;
  data?: {
    avatarUrl: string;
  };
};

/**
 * Server Action to upload user avatar
 * Validates file and sends to API
 * @param file - The image file to upload
 * @param token - Authorization token from client
 * @returns Result with avatar URL or error message
 */
export async function uploadAvatarAction(
  file: File,
  token: string
): Promise<UploadAvatarActionState> {
  try {
    // Validate file using schema
    const validatedFile = avatarUploadSchema.parse({ file });

    console.log("[UploadAvatar Debug] Uploading avatar", {
      fileName: validatedFile.file.name,
      fileSize: validatedFile.file.size,
      fileType: validatedFile.file.type,
    });

    // Call the API to upload avatar with token
    const response = await uploadAvatar(validatedFile.file, token);

    if (!response.success) {
      console.error("[UploadAvatar API Error]", {
        message: "Failed to upload avatar",
      });

      return {
        success: false,
        message: "Falha ao enviar avatar. Tente novamente.",
      };
    }

    return {
      success: true,
      message: response.message || "Avatar enviado com sucesso",
      data: response.data,
    };
  } catch (error) {
    console.error("[UploadAvatar Action Error]", error);

    // Handle validation errors
    if (error instanceof Error && "errors" in error) {
      const validationError = error as any;
      return {
        success: false,
        message:
          validationError.errors?.[0]?.message ||
          "Arquivo inválido. Verifique o formato e tamanho.",
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
            errorData.message || "Erro ao enviar avatar. Tente novamente.",
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
      message: "Erro inesperado ao enviar avatar. Tente novamente mais tarde.",
    };
  }
}
