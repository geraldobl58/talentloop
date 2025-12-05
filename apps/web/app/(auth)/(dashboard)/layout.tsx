"use client";

import { useEffect, useState, useMemo, memo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCookie, deleteCookie } from "cookies-next";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";

import { filterMenuByRole, RoleType } from "@talentloop/roles";

import { APP_CONSTANTS, PAGE_TITLES } from "@/app/libs/constants";
import { HeaderAppBar } from "@/app/components/header-app-bar";
import { SidebarDrawer } from "@/app/components/sidebar-drawer";

import { candidateMenuItems } from "@/app/features/dashboard/candidate/components/candidate-menu-items";
import { companyMenuItems } from "@/app/features/dashboard/company/components/company-menu-items";

import { TenantType } from "@/app/shared/types/tenant-type";
import { USER_TYPE_CONFIGS, UserType } from "@/app/shared/types/user-type";

import { mapTenantTypeToUserType } from "@/app/libs/map-tenant-type-to-user-type";
import { useProfile } from "@/app/hooks/use-profile";

// Memoized loading component
const LoadingState = memo(function LoadingState() {
  return (
    <Box className="min-h-screen bg-gray-50 p-6">
      <Box className="flex items-center justify-center h-screen">
        <CircularProgress />
      </Box>
    </Box>
  );
});

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados do perfil do usuário logado (nome, role, etc)
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  useEffect(() => {
    // Check for auth and tenant type (from API)
    const token = getCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN);
    const tenantType = getCookie(APP_CONSTANTS.COOKIES.TENANT_TYPE) as
      | TenantType
      | undefined;

    if (!token) {
      router.push("/auth/sign-in");
      return;
    }

    // Map API's TenantType to frontend's UserType
    const mappedUserType = mapTenantTypeToUserType(tenantType);

    queueMicrotask(() => {
      setUserType(mappedUserType);
      setIsLoading(false);
    });
  }, [router]);

  // Memoize logout handler
  const handleLogout = useCallback(() => {
    deleteCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN);
    deleteCookie(APP_CONSTANTS.COOKIES.TENANT_TYPE);
    router.push("/auth/sign-in");
  }, [router]);

  // Memoize config to prevent unnecessary recalculations
  const config = useMemo(
    () => (userType ? USER_TYPE_CONFIGS[userType] : null),
    [userType]
  );

  // Memoize user role
  const userRole = profile?.role as RoleType | undefined;

  // Memoize menu items based on user type and role
  const menuItems = useMemo(() => {
    if (!userType) return [];
    return userType === UserType.CANDIDATE
      ? candidateMenuItems
      : filterMenuByRole(companyMenuItems, userRole);
  }, [userType, userRole]);

  // Memoize page config
  const pageConfig = useMemo(
    () =>
      config
        ? PAGE_TITLES[pathname] || {
            title: config.dashboardTitle,
            description: config.dashboardDescription,
          }
        : null,
    [pathname, config]
  );

  // Memoize header config
  const headerConfig = useMemo(
    () =>
      config && pageConfig
        ? {
            ...config,
            dashboardTitle: pageConfig.title,
            dashboardDescription: pageConfig.description,
          }
        : null,
    [config, pageConfig]
  );

  // Memoize first name
  const firstName = useMemo(
    () => profile?.name?.split(" ")[0] || "Usuário",
    [profile?.name]
  );

  if (isLoading || !userType || isProfileLoading || !config || !headerConfig) {
    return <LoadingState />;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <HeaderAppBar config={headerConfig} />
      <SidebarDrawer
        menuItems={menuItems}
        userType={userType}
        profile={profile ?? null}
        firstName={firstName}
        handleLogout={handleLogout}
        config={config}
        currentPath={pathname}
      />

      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
