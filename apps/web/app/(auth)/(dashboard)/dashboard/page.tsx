"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie, deleteCookie } from "cookies-next";

import {
  AppBar,
  Box,
  Chip,
  CircularProgress,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { Logout } from "@mui/icons-material";

const drawerWidth = 340;

import { filterMenuByRole, RoleType } from "@talentloop/roles";

import { CandidateCard } from "@/app/features/dashboard/candidate/components/candidate-card";
import { CompanyCard } from "@/app/features/dashboard/company/components/company-card";
import { candidateMenuItems } from "@/app/features/dashboard/candidate/components/candidate-menu-items";
import { companyMenuItems } from "@/app/features/dashboard/company/components/company-menu-items";

import { Logo } from "@/app/components/logo";

import { TenantType } from "@/app/shared/types/tenant-type";
import { USER_TYPE_CONFIGS, UserType } from "@/app/shared/types/user-type";

import { mapTenantTypeToUserType } from "@/app/libs/map-tenant-type-to-user-type";
import { useProfile } from "@/app/hooks/use-profile";

const DashboardPage = () => {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados do perfil do usuário logado (nome, role, etc)
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  useEffect(() => {
    // Check for auth and tenant type (from API)
    const token = getCookie("access_token");
    const tenantType = getCookie("tenant_type") as TenantType | undefined;

    if (!token) {
      router.push("/auth/sign-in");
      return;
    }

    // Map API's TenantType to frontend's UserType
    // This ensures data isolation - the type comes from the server/database
    const mappedUserType = mapTenantTypeToUserType(tenantType);

    // Use a microtask to avoid sync setState warning
    queueMicrotask(() => {
      setUserType(mappedUserType);
      setIsLoading(false);
    });
  }, [router]);

  const handleLogout = () => {
    deleteCookie("access_token");
    deleteCookie("tenant_type");
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
  // Para candidatos: mostra todos os itens (candidatos não usam sistema de roles)
  // Para empresas: filtra baseado na role do usuário
  const menuItems =
    userType === UserType.CANDIDATE
      ? candidateMenuItems
      : filterMenuByRole(companyMenuItems, userRole);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Box>
            <Typography variant="h6" noWrap component="div">
              {config.dashboardTitle}
            </Typography>
            <Typography variant="body2">
              {config.dashboardDescription}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar className="flex items-center justify-between px-4">
          <Logo />
          <Chip
            label={config.label}
            color={userType === UserType.CANDIDATE ? "primary" : "secondary"}
            size="small"
          />
        </Toolbar>
        <Divider />
        <Box className="flex flex-col justify-between h-full p-2">
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton selected={item.href === "/dashboard"}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Box className="flex items-center justify-between gap-2 p-2">
            <Box>
              {/* Função/Role só é exibida para empresas */}
              {userType === UserType.COMPANY && profile?.role && (
                <Box className="flex items-center gap-1 mb-0.5">
                  Função:
                  <Chip label={profile.role} size="small" />
                </Box>
              )}
              <Typography variant="body2">
                Olá, <span className="font-bold">{firstName}</span>,
                bem-vindo(a) de volta!
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Box>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
      >
        <Toolbar />
        <Box>
          {userType === UserType.CANDIDATE ? (
            <CandidateCard />
          ) : (
            <CompanyCard />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
