"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCookie, deleteCookie } from "cookies-next";

import { Box, CircularProgress, CssBaseline, Toolbar } from "@mui/material";

import { filterMenuByRole, RoleType } from "@talentloop/roles";

import { APP_CONSTANTS } from "@/app/libs/constants";
import { HeaderAppBar } from "@/app/components/header-app-bar";
import { SidebarDrawer } from "@/app/components/sidebar-drawer";

import { candidateMenuItems } from "@/app/features/dashboard/candidate/components/candidate-menu-items";
import { companyMenuItems } from "@/app/features/dashboard/company/components/company-menu-items";

import { TenantType } from "@/app/shared/types/tenant-type";
import { USER_TYPE_CONFIGS, UserType } from "@/app/shared/types/user-type";

import { mapTenantTypeToUserType } from "@/app/libs/map-tenant-type-to-user-type";
import { useProfile } from "@/app/hooks/use-profile";

// Títulos das páginas baseado na rota
const PAGE_TITLES: Record<string, { title: string; description: string }> = {
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

  const handleLogout = () => {
    deleteCookie(APP_CONSTANTS.COOKIES.ACCESS_TOKEN);
    deleteCookie(APP_CONSTANTS.COOKIES.TENANT_TYPE);
    router.push("/auth/sign-in");
  };

  if (isLoading || !userType || isProfileLoading) {
    return (
      <Box className="min-h-screen bg-gray-50 p-6">
        <Box className="flex items-center justify-center h-screen">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  const config = USER_TYPE_CONFIGS[userType];

  // Extrair primeiro nome para saudação
  const firstName = profile?.name?.split(" ")[0] || "Usuário";

  // Role do usuário (apenas para empresas)
  const userRole = profile?.role as RoleType | undefined;

  // Filtrar menu items baseado na role do usuário
  const menuItems =
    userType === UserType.CANDIDATE
      ? candidateMenuItems
      : filterMenuByRole(companyMenuItems, userRole);

  // Obter título da página atual
  const pageConfig = PAGE_TITLES[pathname] || {
    title: config.dashboardTitle,
    description: config.dashboardDescription,
  };

  // Criar config dinâmico para o header baseado na rota atual
  const headerConfig = {
    ...config,
    dashboardTitle: pageConfig.title,
    dashboardDescription: pageConfig.description,
  };

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
