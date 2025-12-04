"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { RoleType, hasRequiredRole, hasMinimumRole } from "@talentloop/roles";
import { useProfile } from "@/app/hooks/use-profile";
import { TenantType } from "@/app/shared/types/tenant-type";

interface RoleGuardProps {
  children: React.ReactNode;
  /**
   * Lista de roles permitidas (OR - qualquer uma das roles)
   * Ex: [RoleType.OWNER, RoleType.ADMIN]
   */
  allowedRoles?: RoleType[];
  /**
   * Role mínima necessária (usa hierarquia)
   * Ex: RoleType.MANAGER = permite MANAGER, ADMIN, OWNER
   */
  minimumRole?: RoleType;
  /**
   * Tipos de tenant permitidos
   * Ex: ["COMPANY"] = só empresas podem acessar
   */
  allowedTenantTypes?: TenantType[];
  /**
   * Rota para redirecionar quando não autorizado
   * Default: /dashboard
   */
  fallbackRoute?: string;
  /**
   * Mensagem de acesso negado
   */
  deniedMessage?: string;
  /**
   * Callback quando acesso é negado
   */
  onAccessDenied?: () => void;
}

/**
 * Componente para proteger rotas baseado em roles e tenant type
 *
 * @example
 * // Apenas OWNER e ADMIN podem acessar
 * <RoleGuard allowedRoles={[RoleType.OWNER, RoleType.ADMIN]}>
 *   <AdminPage />
 * </RoleGuard>
 *
 * // Qualquer role >= MANAGER pode acessar
 * <RoleGuard minimumRole={RoleType.MANAGER}>
 *   <ManagerPage />
 * </RoleGuard>
 *
 * // Apenas empresas podem acessar
 * <RoleGuard allowedTenantTypes={["COMPANY"]}>
 *   <CompanyOnlyPage />
 * </RoleGuard>
 *
 * // Empresas com role OWNER ou ADMIN
 * <RoleGuard
 *   allowedTenantTypes={["COMPANY"]}
 *   allowedRoles={[RoleType.OWNER, RoleType.ADMIN]}
 * >
 *   <CompanyAdminPage />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  allowedRoles,
  minimumRole,
  allowedTenantTypes,
  fallbackRoute = "/dashboard",
  deniedMessage = "Você não tem permissão para acessar esta página.",
  onAccessDenied,
}: RoleGuardProps) {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();

  const userRole = profile?.role as RoleType | undefined;
  const tenantType = profile?.tenantType;

  // Verificar acesso
  const checkAccess = (): boolean => {
    // Se não tem profile ainda, não verificar
    if (!profile) return false;

    // Verificar tenant type se especificado
    if (allowedTenantTypes && allowedTenantTypes.length > 0) {
      if (!tenantType || !allowedTenantTypes.includes(tenantType)) {
        return false;
      }
    }

    // Para candidatos, não verificamos roles (eles não têm roles)
    if (tenantType === "CANDIDATE") {
      // Se só verificava tenant type, candidato pode acessar
      if (!allowedRoles && !minimumRole) {
        return true;
      }
      // Se exigia roles, candidato não pode acessar
      return false;
    }

    // Para empresas, verificar roles
    if (tenantType === "COMPANY") {
      // Se não exige role específica, empresa pode acessar
      if (!allowedRoles && !minimumRole) {
        return true;
      }

      // Verificar role específica
      if (allowedRoles && allowedRoles.length > 0) {
        return hasRequiredRole(userRole, allowedRoles);
      }

      // Verificar role mínima
      if (minimumRole) {
        return hasMinimumRole(userRole, minimumRole);
      }
    }

    return false;
  };

  const hasAccess = !isLoading && checkAccess();

  useEffect(() => {
    if (!isLoading && !hasAccess && profile) {
      onAccessDenied?.();
      router.push(fallbackRoute);
    }
  }, [isLoading, hasAccess, profile, router, fallbackRoute, onAccessDenied]);

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">
          Verificando permissões...
        </Typography>
      </Box>
    );
  }

  // Acesso negado
  if (!hasAccess) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">{deniedMessage}</Typography>
      </Box>
    );
  }

  // Acesso permitido
  return <>{children}</>;
}

/**
 * Hook para verificar permissões sem renderização
 */
export function useRoleCheck() {
  const { data: profile, isLoading } = useProfile();

  const userRole = profile?.role as RoleType | undefined;
  const tenantType = profile?.tenantType;

  return {
    isLoading,
    userRole,
    tenantType,
    hasRole: (roles: RoleType[]) => hasRequiredRole(userRole, roles),
    hasMinRole: (minRole: RoleType) => hasMinimumRole(userRole, minRole),
    isCompany: tenantType === "COMPANY",
    isCandidate: tenantType === "CANDIDATE",
    hasCompanyRole: (roles: RoleType[]) =>
      tenantType === "COMPANY" && hasRequiredRole(userRole, roles),
  };
}
