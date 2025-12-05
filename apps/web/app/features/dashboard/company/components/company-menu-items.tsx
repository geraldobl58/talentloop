import {
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { createElement } from "react";

import { RoleType } from "@talentloop/roles";

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  /** Roles que podem ver este item. Se não definido, todos podem ver */
  roles?: RoleType[];
}

// Função para criar menu items com ícones lazy
const createMenuItem = (
  label: string,
  IconComponent: React.ElementType,
  href: string,
  roles?: RoleType[]
): MenuItem => ({
  label,
  icon: createElement(IconComponent),
  href,
  ...(roles && { roles }),
});

export const companyMenuItems: MenuItem[] = [
  createMenuItem("Dashboard", DashboardIcon, "/dashboard"),
  createMenuItem("Vagas", WorkIcon, "/jobs"),
  createMenuItem("Candidatos", PeopleIcon, "/candidates"),
  createMenuItem("Processos", AssessmentIcon, "/processes"),
  createMenuItem("Relatórios", TrendingUpIcon, "/reports"),
  createMenuItem("Empresa", BusinessIcon, "/company"),
  createMenuItem("Meu Plano", BusinessIcon, "/my-plans", [
    RoleType.OWNER,
    RoleType.ADMIN,
  ]),
  createMenuItem("Usuários", PeopleIcon, "/users", [
    RoleType.OWNER,
    RoleType.ADMIN,
  ]),
  createMenuItem("Meu Perfil", SettingsIcon, "/profile"),
];
