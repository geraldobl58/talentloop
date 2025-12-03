import ky from "ky";

import {
  Generate2FAApiResponse,
  Generate2FAResponse,
  Enable2FAApiResponse,
  Enable2FAResponse,
  Disable2FAApiResponse,
  Disable2FAResponse,
  Check2FAStatusApiResponse,
  Check2FAStatusResponse,
  RegenerateBakupCodesApiResponse,
  RegenerateBakupCodesResponse,
} from "../types/profile-2fa";

import { env } from "@/app/libs/env";

/**
 * Generates 2FA secret and QR code
 * @param token - Authorization token
 * @returns Promise with secret and QR code
 * @throws HTTPError if the request fails
 */
export async function generate2FA(token: string): Promise<Generate2FAResponse> {
  try {
    const authenticatedApi = ky.create({
      prefixUrl: env.NEXT_PUBLIC_API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await authenticatedApi
      .get("auth/2fa/generate")
      .json<Generate2FAApiResponse>();

    return {
      success: true,
      message: "Código QR gerado com sucesso",
      data: {
        secret: response.secret,
        qrCode: response.qrCode,
      },
    };
  } catch (error) {
    console.error("[Generate 2FA Error]", error);
    throw error;
  }
}

/**
 * Enables 2FA by verifying TOTP token
 * @param token - TOTP token (6 digits)
 * @param twoFactorToken - Authorization token
 * @returns Promise with backup codes
 * @throws HTTPError if the request fails
 */
export async function enable2FA(
  token: string,
  twoFactorToken: string
): Promise<Enable2FAResponse> {
  try {
    const authenticatedApi = ky.create({
      prefixUrl: env.NEXT_PUBLIC_API_URL,
      headers: {
        Authorization: `Bearer ${twoFactorToken}`,
      },
    });

    const response = await authenticatedApi
      .post("auth/2fa/enable", {
        json: {
          token,
        },
      })
      .json<Enable2FAApiResponse>();

    return {
      success: true,
      message: response.message || "2FA ativado com sucesso",
      data: {
        backupCodes: response.backupCodes,
      },
    };
  } catch (error) {
    console.error("[Enable 2FA Error]", error);
    throw error;
  }
}

/**
 * Disables 2FA
 * @param token - TOTP token or backup code (6-8 characters)
 * @param twoFactorToken - Authorization token
 * @returns Promise with success status
 * @throws HTTPError if the request fails
 */
export async function disable2FA(
  token: string,
  twoFactorToken: string
): Promise<Disable2FAResponse> {
  try {
    const authenticatedApi = ky.create({
      prefixUrl: env.NEXT_PUBLIC_API_URL,
      headers: {
        Authorization: `Bearer ${twoFactorToken}`,
      },
    });

    const response = await authenticatedApi
      .delete("auth/2fa/disable", {
        json: {
          token,
        },
      })
      .json<Disable2FAApiResponse>();

    return {
      success: response.success,
      message: response.message || "2FA desativado com sucesso",
    };
  } catch (error) {
    console.error("[Disable 2FA Error]", error);
    throw error;
  }
}

/**
 * Checks 2FA status
 * @param token - Authorization token
 * @returns Promise with 2FA status
 * @throws HTTPError if the request fails
 */
export async function check2FAStatus(
  token: string
): Promise<Check2FAStatusResponse> {
  try {
    const authenticatedApi = ky.create({
      prefixUrl: env.NEXT_PUBLIC_API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await authenticatedApi
      .get("auth/2fa/status")
      .json<Check2FAStatusApiResponse>();

    return {
      success: true,
      data: {
        twoFactorEnabled: response.twoFactorEnabled,
      },
    };
  } catch (error) {
    console.error("[Check 2FA Status Error]", error);
    throw error;
  }
}

/**
 * Regenerates backup codes for 2FA
 * @param twoFactorToken - TOTP token or backup code (6-8 characters)
 * @param authToken - Authorization token
 * @returns Promise with new backup codes
 * @throws HTTPError if the request fails
 */
export async function regenerateBackupCodes(
  twoFactorToken: string,
  authToken: string
): Promise<RegenerateBakupCodesResponse> {
  try {
    const authenticatedApi = ky.create({
      prefixUrl: env.NEXT_PUBLIC_API_URL,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const response = await authenticatedApi
      .post("auth/2fa/regenerate-backup-codes", {
        json: {
          token: twoFactorToken,
        },
      })
      .json<RegenerateBakupCodesApiResponse>();

    return {
      success: true,
      message: response.message || "Códigos de backup regenerados com sucesso",
      data: {
        backupCodes: response.backupCodes,
      },
    };
  } catch (error) {
    console.error("[Regenerate Backup Codes Error]", error);
    throw error;
  }
}
