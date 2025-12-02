"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/app/libs/api-client";

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string | null;
  roleDescription: string | null;
  tenantId: string;
  tenantType: "CANDIDATE" | "COMPANY";
  tenant: {
    id: string;
    plan: string;
    planExpiresAt: string | null;
  };
}

async function fetchProfile(): Promise<UserProfile> {
  return api.get("auth/profile").json<UserProfile>();
}

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: false,
  });
};
