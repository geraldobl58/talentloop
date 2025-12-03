import ky from "ky";

import {
  ChangePasswordApiResponse,
  ChangePasswordResponse,
} from "../types/change-password";

import { env } from "@/app/libs/env";

/**
 * Changes user password
 * Sends current and new password to API
 * @param currentPassword - The current password
 * @param newPassword - The new password
 * @param token - Authorization token
 * @returns Promise with change password result
 * @throws HTTPError if the request fails
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  token: string
): Promise<ChangePasswordResponse> {
  try {
    // Create a new API instance with the provided token
    const authenticatedApi = ky.create({
      prefixUrl: env.NEXT_PUBLIC_API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Send request to API
    const response = await authenticatedApi
      .post("auth/change-password", {
        json: {
          currentPassword,
          newPassword,
        },
      })
      .json<ChangePasswordApiResponse>();

    return {
      success: true,
      message: response.message || "Senha alterada com sucesso",
    };
  } catch (error) {
    console.error("[Change Password Error]", error);
    throw error;
  }
}
