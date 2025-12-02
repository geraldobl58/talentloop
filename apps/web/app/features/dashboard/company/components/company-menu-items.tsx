import {
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
} from "@mui/icons-material";

import { RoleType } from "@talentloop/roles";

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  /** Roles que podem ver este item. Se não definido, todos podem ver */
  roles?: RoleType[];
}

export const companyMenuItems: MenuItem[] = [
  { label: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" },
  { label: "Vagas", icon: <WorkIcon />, href: "/jobs" },
  { label: "Candidatos", icon: <PeopleIcon />, href: "/candidates" },
  { label: "Processos", icon: <AssessmentIcon />, href: "/processes" },
  { label: "Relatórios", icon: <TrendingUpIcon />, href: "/reports" },
  { label: "Empresa", icon: <BusinessIcon />, href: "/company" },
  {
    label: "Usuários",
    icon: <PeopleIcon />,
    href: "/users",
    roles: [RoleType.OWNER, RoleType.ADMIN], // Apenas OWNER e ADMIN podem ver
  },
  { label: "Meu Perfil", icon: <SettingsIcon />, href: "/profile" },
];
