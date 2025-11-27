/**
 * Application Enums
 */

export enum LimitType {
  PROPERTIES = 'properties',
  USERS = 'users',
  CONTACTS = 'contacts',
}

export enum PlanTier {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
}

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum AuthMethod {
  PASSWORD = 'password',
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  SAML = 'saml',
}

export enum TwoFactorMethod {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  BACKUP_CODE = 'backup_code',
}
