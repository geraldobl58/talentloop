import ky from "ky";

import {
  UploadAvatarApiResponse,
  UploadAvatarResponse,
} from "../types/upload-avatar";

import { env } from "@/app/libs/env";

/**
 * Uploads avatar image to API
 * Sends file as FormData to the uploadAvatar endpoint
 * @param file - The image file to upload
 * @param token - Authorization token
 * @returns Promise with upload result
 * @throws HTTPError if the request fails
 */
export async function uploadAvatar(
  file: File,
  token: string
): Promise<UploadAvatarResponse> {
  try {
    // Create FormData to send file
    // Note: API expects field name "avatar", not "file"
    const formData = new FormData();
    formData.append("avatar", file);

    // Create a new API instance with the provided token
    const authenticatedApi = ky.create({
      prefixUrl: env.NEXT_PUBLIC_API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Send request to API with explicit authentication
    const response = await authenticatedApi
      .post("auth/upload-avatar", {
        body: formData,
      })
      .json<UploadAvatarApiResponse>();

    return {
      success: true,
      message: response.message || "Avatar uploaded successfully",
      data: {
        avatarUrl: response.avatar,
      },
    };
  } catch (error) {
    console.error("[Avatar Upload Error]", error);
    throw error;
  }
}
