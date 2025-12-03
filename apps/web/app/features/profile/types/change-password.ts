/**
 * API response structure for change password
 */
export interface ChangePasswordApiResponse {
  message: string;
}

/**
 * Standardized change password response
 */
export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}
