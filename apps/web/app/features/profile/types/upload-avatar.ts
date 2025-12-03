/**
 * API response structure for avatar upload
 */
export interface UploadAvatarApiResponse {
  message: string;
  avatar: string;
}

/**
 * Standardized upload avatar response
 */
export interface UploadAvatarResponse {
  success: boolean;
  message?: string;
  data?: {
    avatarUrl: string;
  };
}
