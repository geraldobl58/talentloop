/**
 * Re-export from shared types for backward compatibility
 */
export {
  UserType,
  USER_TYPE_CONFIGS,
  DEFAULT_CANDIDATE_TENANT,
  type UserTypeConfig,
} from "@/app/shared/types/user-type";

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
