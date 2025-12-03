"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";

import {
  check2FAStatusAction,
  Check2FAStatusActionState,
  generate2FAAction,
  Generate2FAActionState,
  enable2FAAction,
  Enable2FAActionState,
  disable2FAAction,
  Disable2FAActionState,
  regenerateBackupCodesAction,
  RegenerateBackupCodesActionState,
} from "../actions/profile-2fa";

// Query keys
export const twoFactorQueryKeys = {
  status: ["2fa-status"] as const,
};

interface UseCheck2FAStatusOptions {
  enabled?: boolean;
}

interface UseGenerate2FAOptions {
  onSuccess?: (data: Generate2FAActionState) => void;
  onError?: (error: Error) => void;
}

interface UseEnable2FAOptions {
  onSuccess?: (data: Enable2FAActionState) => void;
  onError?: (error: Error) => void;
}

interface UseDisable2FAOptions {
  onSuccess?: (data: Disable2FAActionState) => void;
  onError?: (error: Error) => void;
}

interface UseRegenerateBackupCodesOptions {
  onSuccess?: (data: RegenerateBackupCodesActionState) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to check 2FA status
 */
export function useCheck2FAStatus(options?: UseCheck2FAStatusOptions) {
  return useQuery({
    queryKey: twoFactorQueryKeys.status,
    queryFn: async (): Promise<Check2FAStatusActionState> => {
      const token = getCookie("access_token");

      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      return check2FAStatusAction(token as string);
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to generate 2FA secret and QR code
 */
export function useGenerate2FA(options?: UseGenerate2FAOptions) {
  return useMutation({
    mutationFn: async (): Promise<Generate2FAActionState> => {
      const token = getCookie("access_token");

      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      return generate2FAAction(token as string);
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to enable 2FA
 */
export function useEnable2FA(options?: UseEnable2FAOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (totpToken: string): Promise<Enable2FAActionState> => {
      const token = getCookie("access_token");

      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      return enable2FAAction(totpToken, token as string);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate status query to refetch
        queryClient.invalidateQueries({ queryKey: twoFactorQueryKeys.status });
      }
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to disable 2FA
 */
export function useDisable2FA(options?: UseDisable2FAOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (totpToken: string): Promise<Disable2FAActionState> => {
      const token = getCookie("access_token");

      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      return disable2FAAction(totpToken, token as string);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate status query to refetch
        queryClient.invalidateQueries({ queryKey: twoFactorQueryKeys.status });
      }
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook to regenerate backup codes
 */
export function useRegenerateBackupCodes(
  options?: UseRegenerateBackupCodesOptions
) {
  return useMutation({
    mutationFn: async (
      totpToken: string
    ): Promise<RegenerateBackupCodesActionState> => {
      const token = getCookie("access_token");

      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      return regenerateBackupCodesAction(totpToken, token as string);
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Combined hook for easier usage
 * Returns all 2FA hooks in a single object
 */
export function useProfile2FA() {
  const statusQuery = useCheck2FAStatus();
  const generateMutation = useGenerate2FA();
  const enableMutation = useEnable2FA();
  const disableMutation = useDisable2FA();
  const regenerateMutation = useRegenerateBackupCodes();

  return {
    // Status
    status: statusQuery,
    isEnabled: statusQuery.data?.data?.twoFactorEnabled ?? false,
    isLoadingStatus: statusQuery.isLoading,

    // Generate
    generate: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    generateData: generateMutation.data,

    // Enable
    enable: enableMutation.mutateAsync,
    isEnabling: enableMutation.isPending,
    enableData: enableMutation.data,

    // Disable
    disable: disableMutation.mutateAsync,
    isDisabling: disableMutation.isPending,

    // Regenerate
    regenerate: regenerateMutation.mutateAsync,
    isRegenerating: regenerateMutation.isPending,
    regenerateData: regenerateMutation.data,

    // General loading state
    isLoading:
      generateMutation.isPending ||
      enableMutation.isPending ||
      disableMutation.isPending ||
      regenerateMutation.isPending,
  };
}
