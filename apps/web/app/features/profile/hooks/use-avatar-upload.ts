"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next";

import {
  uploadAvatarAction,
  UploadAvatarActionState,
} from "../actions/upload-avatar";

interface UseAvatarUploadOptions {
  onSuccess?: (data: UploadAvatarActionState) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for avatar upload with React Query
 * Handles file upload with optimistic updates and cache invalidation
 */
export function useAvatarUpload(options?: UseAvatarUploadOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const token = getCookie("access_token");

      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      return uploadAvatarAction(file, token as string);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate profile query to refetch with new avatar
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
