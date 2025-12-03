/**
 * API response for generating 2FA
 */
export interface Generate2FAApiResponse {
  secret: string;
  qrCode: string;
}

/**
 * Standardized generate 2FA response
 */
export interface Generate2FAResponse {
  success: boolean;
  message?: string;
  data?: {
    secret: string;
    qrCode: string;
  };
}

/**
 * API response for enabling 2FA
 */
export interface Enable2FAApiResponse {
  success: boolean;
  backupCodes: string[];
  message: string;
}

/**
 * Standardized enable 2FA response
 */
export interface Enable2FAResponse {
  success: boolean;
  message?: string;
  data?: {
    backupCodes: string[];
  };
}

/**
 * API response for disabling 2FA
 */
export interface Disable2FAApiResponse {
  success: boolean;
  message: string;
}

/**
 * Standardized disable 2FA response
 */
export interface Disable2FAResponse {
  success: boolean;
  message?: string;
}

/**
 * API response for checking 2FA status
 */
export interface Check2FAStatusApiResponse {
  twoFactorEnabled: boolean;
}

/**
 * Standardized check 2FA status response
 */
export interface Check2FAStatusResponse {
  success: boolean;
  data?: {
    twoFactorEnabled: boolean;
  };
}

/**
 * API response for regenerating backup codes
 */
export interface RegenerateBakupCodesApiResponse {
  success: boolean;
  backupCodes: string[];
  message: string;
}

/**
 * Standardized regenerate backup codes response
 */
export interface RegenerateBakupCodesResponse {
  success: boolean;
  message?: string;
  data?: {
    backupCodes: string[];
  };
}
