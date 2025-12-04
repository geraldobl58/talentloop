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
    MY_PLANS: "/my-plans",
    PLANS: "/plans",
    PROFILE: "/profile",
  },
} as const;

/**
 * Mensagens de erro padronizadas
 */
export const ERROR_MESSAGES = {
  // Generic errors
  API_CONNECTION: "Erro ao conectar com a API. Tente novamente.",
  SERVER_RESPONSE: "Erro ao processar resposta do servidor.",
  UNEXPECTED: "Ocorreu um erro inesperado. Tente novamente.",

  // Auth errors
  SIGN_IN: "Erro ao realizar login",
  SIGN_UP: "Erro ao criar conta",
  FORGOT_PASSWORD: "Erro ao solicitar redefinição de senha.",
  RESET_PASSWORD: "Erro ao redefinir senha",
  INVALID_CREDENTIALS: "Credenciais inválidas",

  // Plan errors
  PLAN_UPGRADE: "Erro ao fazer upgrade do plano",
  PLAN_CANCEL: "Erro ao cancelar plano",
  PLAN_REACTIVATE: "Erro ao reativar plano",
  BILLING_PORTAL: "Erro ao abrir portal de cobrança",
  BILLING_PORTAL_UNAVAILABLE:
    "Portal de pagamento não disponível. Por favor, entre em contato com o suporte.",

  // Profile errors
  CHANGE_PASSWORD: "Erro ao alterar senha",
  UPLOAD_AVATAR: "Erro ao fazer upload do avatar",
  UPDATE_PROFILE: "Erro ao atualizar perfil",

  // 2FA errors
  TWO_FACTOR_ENABLE: "Erro ao habilitar autenticação de dois fatores",
  TWO_FACTOR_DISABLE: "Erro ao desabilitar autenticação de dois fatores",
  TWO_FACTOR_VERIFY: "Erro ao verificar código",
} as const;

/**
 * Mensagens de sucesso padronizadas
 */
export const SUCCESS_MESSAGES = {
  // Auth
  SIGN_UP: "Conta criada com sucesso!",
  SIGN_IN: "Login realizado com sucesso!",
  FORGOT_PASSWORD:
    "Se o email existir em nossa base, você receberá instruções para redefinir sua senha.",
  RESET_PASSWORD: "Senha redefinida com sucesso!",

  // Plan
  PLAN_UPGRADED: "Plano atualizado com sucesso!",
  PLAN_CANCELLED: "Plano cancelado com sucesso!",
  PLAN_REACTIVATED: "Plano reativado com sucesso!",

  // Profile
  PASSWORD_CHANGED: "Senha alterada com sucesso!",
  AVATAR_UPLOADED: "Avatar atualizado com sucesso!",
  PROFILE_UPDATED: "Perfil atualizado com sucesso!",

  // 2FA
  TWO_FACTOR_ENABLED: "Autenticação de dois fatores habilitada!",
  TWO_FACTOR_DISABLED: "Autenticação de dois fatores desabilitada!",
} as const;

export const PAGE_TITLES: Record<
  string,
  { title: string; description: string }
> = {
  "/dashboard": { title: "Dashboard", description: "Visão geral" },
  "/profile": {
    title: "Meu Perfil",
    description: "Gerencie suas informações pessoais",
  },
  "/jobs": { title: "Vagas", description: "Gerencie as vagas da empresa" },
  "/candidates": { title: "Candidatos", description: "Gerencie os candidatos" },
  "/processes": {
    title: "Processos",
    description: "Gerencie os processos seletivos",
  },
  "/reports": {
    title: "Relatórios",
    description: "Visualize relatórios e métricas",
  },
  "/company": { title: "Empresa", description: "Informações da empresa" },
  "/users": {
    title: "Usuários",
    description: "Gerencie os usuários da empresa",
  },
  "/applications": { title: "Candidaturas", description: "Suas candidaturas" },
  "/saved-jobs": {
    title: "Vagas Salvas",
    description: "Vagas que você salvou",
  },
  "/interviews": {
    title: "Entrevistas",
    description: "Suas entrevistas agendadas",
  },
};
