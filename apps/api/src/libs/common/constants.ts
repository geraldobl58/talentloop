/**
 * Application Constants
 * Valores fixos e configurações padrão da aplicação
 */

export const APP_CONSTANTS = {
  // JWT Configuration
  JWT: {
    DEFAULT_EXPIRES_IN: '1d',
  },

  // Throttler Configuration
  THROTTLER: {
    TTL_MS: 3600000, // 1 hora em milissegundos
    DEFAULT_LIMIT: 100,
  },

  // File Upload Configuration
  FILE_UPLOAD: {
    MAX_SIZE_MB: 5,
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    CLOUDINARY_AVATAR_FOLDER: 'sass-multitenant/avatars',
  },

  // Two Factor Authentication
  TWO_FACTOR: {
    TOTP_STEP_SECONDS: 30, // Token válido por 30 segundos
    TOTP_WINDOW: 1, // Aceita 1 token anterior e 1 posterior
    BACKUP_CODES_COUNT: 8,
    BACKUP_CODE_LENGTH: 4, // 4 bytes = 8 caracteres hex
  },

  // Password Reset
  PASSWORD_RESET: {
    TOKEN_EXPIRES_HOURS: 1,
    TOKEN_LENGTH_BYTES: 32,
  },

  // Email Configuration
  EMAIL: {
    DEFAULT_HOST: 'sandbox.smtp.mailtrap.io',
    DEFAULT_PORT: 2525,
    DEFAULT_FROM_NAME: 'sass-multitenant Team',
    DEFAULT_FROM: 'noreply@sass-multitenant.com',
    CONNECTION_TIMEOUT_MS: 60000,
    GREETING_TIMEOUT_MS: 30000,
    SOCKET_TIMEOUT_MS: 60000,
    MAX_CONNECTIONS: 5,
    MAX_MESSAGES: 100,
    RETRY_DELAY_MS: 60000, // 1 minuto
  },

  // Database
  DATABASE: {
    BCRYPT_ROUNDS: 10,
  },

  // Security
  SECURITY: {
    RATE_LIMIT_WINDOW_HOURS: 1,
    MAX_LOGIN_ATTEMPTS: 5,
  },

  // Data Retention
  DATA_RETENTION: {
    BACKUP_CODES_REGEN_GRACE_PERIOD_DAYS: 7,
    SOFT_DELETE_RETENTION_DAYS: 90,
  },
} as const;

export const EMAIL_SUBJECTS = {
  WELCOME: '🎉 Bem-vindo ao sass-multitenant',
  PASSWORD_RESET: '🔒 Recuperação de Senha - sass-multitenant',
  LIMIT_ALERT: '⚠️ Aviso: Você está usando',
  CANCELLATION: '❌ Sua assinatura sass-multitenant foi cancelada',
  UPGRADE: '🚀 Parabéns! Seu plano foi atualizado com sucesso',
  TWO_FACTOR_DISABLED: '🔐 Autenticação de Dois Fatores Desativada',
  TWO_FACTOR_ENABLED: '✅ Autenticação de Dois Fatores Ativada',
} as const;

export const MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Credenciais inválidas',
    TWO_FACTOR_REQUIRED: 'Código de autenticação de dois fatores necessário',
    INVALID_2FA_TOKEN: 'Código de autenticação inválido',
    INVALID_PASSWORD: 'Senha atual incorreta',
    PASSWORD_RESET_SUCCESS: 'Senha redefinida com sucesso',
    PASSWORD_CHANGED_SUCCESS: 'Senha alterada com sucesso',
  },
  TWO_FACTOR: {
    ALREADY_ENABLED: '2FA já está ativo para este usuário',
    NOT_ENABLED: '2FA não está ativo',
    USER_NOT_FOUND: 'Usuário não encontrado',
    INVALID_TOKEN: 'Token inválido',
    ENABLED_SUCCESS: '2FA ativado com sucesso',
    DISABLED_SUCCESS: '2FA desativado com sucesso',
    NO_SECRET_GENERATED: 'Você precisa gerar um secret primeiro',
    BACKUP_CODES_REGENERATED: 'Backup codes regenerados com sucesso',
  },
  EMAIL: {
    SEND_SUCCESS: 'Email enviado com sucesso',
    SEND_FAILED: 'Falha ao enviar email',
    MISSING_CONFIG: '⚠️ Configurações de email ausentes',
  },
  ERRORS: {
    USER_NOT_FOUND: 'Usuário não encontrado',
    TENANT_NOT_FOUND: 'Tenant não encontrado',
    PASSWORD_RESET_NOT_FOUND: 'Token inválido ou expirado',
    TOKEN_ALREADY_USED: 'Token já foi utilizado',
    TOKEN_EXPIRED: 'Token expirado',
    AVATAR_UPLOAD_FAILED: 'Erro ao fazer upload do avatar',
  },
} as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
