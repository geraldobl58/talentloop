"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie, deleteCookie } from "cookies-next";

import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  IconButton,
  Skeleton,
} from "@mui/material";

import {
  Work as WorkIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
} from "@mui/icons-material";

import { Logo } from "@/app/components/logo";
import {
  UserType,
  TenantType,
  USER_TYPE_CONFIGS,
} from "@/app/features/auth/sign-in/types/user-type";

// ============================================
// Helper: Map TenantType (from API) to UserType (for UI)
// ============================================
const mapTenantTypeToUserType = (
  tenantType: TenantType | undefined
): UserType => {
  if (tenantType === "COMPANY") {
    return UserType.COMPANY;
  }
  return UserType.CANDIDATE;
};

// ============================================
// Types
// ============================================
interface DashboardStats {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

// ============================================
// Candidate Dashboard Component
// ============================================
const CandidateDashboard = () => {
  const stats: DashboardStats[] = [
    {
      label: "Candidaturas Enviadas",
      value: 12,
      icon: <DescriptionIcon />,
      color: "primary",
    },
    {
      label: "Vagas Salvas",
      value: 8,
      icon: <WorkIcon />,
      color: "secondary",
    },
    {
      label: "Entrevistas Agendadas",
      value: 3,
      icon: <PersonIcon />,
      color: "success",
    },
    {
      label: "Match Score Médio",
      value: "78%",
      icon: <TrendingUpIcon />,
      color: "info",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      label: "Buscar Vagas",
      description: "Encontre oportunidades que combinam com você",
      icon: <SearchIcon />,
      href: "/jobs",
      color: "#3b82f6",
    },
    {
      label: "Meu Currículo",
      description: "Atualize seu perfil profissional",
      icon: <DescriptionIcon />,
      href: "/profile",
      color: "#8b5cf6",
    },
    {
      label: "Candidaturas",
      description: "Acompanhe suas candidaturas",
      icon: <WorkIcon />,
      href: "/applications",
      color: "#10b981",
    },
    {
      label: "Configurações",
      description: "Preferências e notificações",
      icon: <SettingsIcon />,
      href: "/settings",
      color: "#6b7280",
    },
  ];

  return (
    <Box>
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                height: "100%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                  <Box sx={{ opacity: 0.8 }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Ações Rápidas
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: action.color,
                    color: "white",
                    mb: 2,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {action.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Jobs */}
      <Box sx={{ mt: 4 }}>
        <Box className="flex items-center justify-between mb-2">
          <Typography variant="h6" fontWeight="bold">
            Vagas Recomendadas para Você
          </Typography>
          <Button variant="text" size="small">
            Ver todas
          </Button>
        </Box>
        <Card>
          <CardContent>
            <Box className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <Box
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <Box className="flex items-center gap-3">
                    <Avatar sx={{ bgcolor: "#3b82f6" }}>
                      <BusinessIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Desenvolvedor Full Stack
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tech Company • Remoto • R$ 8.000 - R$ 12.000
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label="92% Match" color="success" size="small" />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// ============================================
// Company Dashboard Component
// ============================================
const CompanyDashboard = () => {
  const stats: DashboardStats[] = [
    {
      label: "Vagas Ativas",
      value: 5,
      icon: <WorkIcon />,
      color: "primary",
    },
    {
      label: "Candidaturas Recebidas",
      value: 47,
      icon: <DescriptionIcon />,
      color: "secondary",
    },
    {
      label: "Candidatos em Processo",
      value: 12,
      icon: <PeopleIcon />,
      color: "success",
    },
    {
      label: "Contratações do Mês",
      value: 2,
      icon: <TrendingUpIcon />,
      color: "info",
    },
  ];

  const quickActions: QuickAction[] = [
    {
      label: "Nova Vaga",
      description: "Publique uma nova oportunidade",
      icon: <AddIcon />,
      href: "/jobs/new",
      color: "#3b82f6",
    },
    {
      label: "Candidatos",
      description: "Gerencie os candidatos",
      icon: <PeopleIcon />,
      href: "/candidates",
      color: "#8b5cf6",
    },
    {
      label: "Relatórios",
      description: "Métricas e analytics",
      icon: <AssessmentIcon />,
      href: "/reports",
      color: "#10b981",
    },
    {
      label: "Configurações",
      description: "Configurações da empresa",
      icon: <SettingsIcon />,
      href: "/settings",
      color: "#6b7280",
    },
  ];

  return (
    <Box>
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                height: "100%",
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
              }}
            >
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                  <Box sx={{ opacity: 0.8 }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Ações Rápidas
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: action.color,
                    color: "white",
                    mb: 2,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {action.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Applications */}
      <Box sx={{ mt: 4 }}>
        <Box className="flex items-center justify-between mb-2">
          <Typography variant="h6" fontWeight="bold">
            Candidaturas Recentes
          </Typography>
          <Button variant="text" size="small">
            Ver todas
          </Button>
        </Box>
        <Card>
          <CardContent>
            <Box className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <Box
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <Box className="flex items-center gap-3">
                    <Avatar sx={{ bgcolor: "#f5576c" }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        João Silva
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Desenvolvedor Full Stack • 5 anos de exp.
                      </Typography>
                    </Box>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <Chip label="85% Match" color="success" size="small" />
                    <Chip label="Novo" color="primary" size="small" />
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

// ============================================
// Dashboard Loading Skeleton
// ============================================
const DashboardSkeleton = () => (
  <Box>
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2, 3, 4].map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Skeleton variant="rounded" height={120} />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((_, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Skeleton variant="rounded" height={150} />
        </Grid>
      ))}
    </Grid>
  </Box>
);

// ============================================
// Main Dashboard Page
// ============================================
const DashboardPage = () => {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading || !userType) {
    return (
      <Box className="min-h-screen bg-gray-50 p-6">
        <Box className="max-w-7xl mx-auto">
          <DashboardSkeleton />
        </Box>
      </Box>
    );
  }

  const config = USER_TYPE_CONFIGS[userType];

  return (
    <Box className="min-h-screen bg-gray-50">
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Box className="max-w-7xl mx-auto px-6 py-3">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-4">
              <Logo />
              <Chip
                label={config.label}
                color={
                  userType === UserType.CANDIDATE ? "primary" : "secondary"
                }
                size="small"
              />
            </Box>
            <Box className="flex items-center gap-2">
              <IconButton size="small">
                <SettingsIcon />
              </IconButton>
              <IconButton size="small" onClick={handleLogout} color="error">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {config.dashboardTitle}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {config.dashboardDescription}
          </Typography>
        </Box>

        {/* Render appropriate dashboard based on user type */}
        {userType === UserType.CANDIDATE ? (
          <CandidateDashboard />
        ) : (
          <CompanyDashboard />
        )}
      </Box>
    </Box>
  );
};

export default DashboardPage;
