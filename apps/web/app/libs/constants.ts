/**
 * Application Constants
 * Valores fixos e configurações padrão da aplicação frontend
 */

export const APP_CONSTANTS = {
  // Auth Configuration - deve estar sincronizado com o backend
  AUTH: {
    /**
     * Tempo de expiração do token em segundos (1 dia)
     * Sincronizado com JWT_EXPIRES no backend (APP_CONSTANTS.JWT.DEFAULT_EXPIRES_IN = '1d')
     */
    TOKEN_MAX_AGE_SECONDS: 60 * 60 * 24, // 1 day = 86400 seconds
  },

  // Cookie Configuration
  COOKIES: {
    ACCESS_TOKEN: "access_token",
    TENANT_TYPE: "tenant_type",
  },

  // Redirect delays (ms)
  REDIRECT: {
    AFTER_LOGIN_MS: 800,
    AFTER_SIGNUP_MS: 2000,
    AFTER_RESET_PASSWORD_MS: 2000,
  },

  // Routes
  ROUTES: {
    DASHBOARD: "/dashboard",
    SIGN_IN: "/auth/sign-in",
    SIGN_UP: "/auth/sign-up",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
} as const;
