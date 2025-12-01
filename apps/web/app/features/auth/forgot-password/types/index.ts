/**
 * Request para forgot password
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Resposta bruta da API de forgot password
 */
export interface ForgotPasswordApiResponse {
  success: boolean;
  message?: string;
}

/**
 * Resposta processada para o cliente
 */
export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
}
