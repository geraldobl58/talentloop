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

// Query key for profile - exported for invalidation
export const profileQueryKey = ["profile"] as const;

export const useProfile = () => {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: fetchProfile,
    // Cache profile for 2 minutes - reduces API calls while keeping data reasonably fresh
    staleTime: 1000 * 60 * 2,
    // Keep in cache for 10 minutes
    gcTime: 1000 * 60 * 10,
    // Only retry once
    retry: 1,
    // Don't refetch on window focus - profile rarely changes
    refetchOnWindowFocus: false,
  });
};
