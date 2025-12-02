export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordApiResponse {
  message: string;
  success: boolean;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}
