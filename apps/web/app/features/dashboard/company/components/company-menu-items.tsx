import {
  Assessment as AssessmentIcon,
  Business as BusinessIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
} from "@mui/icons-material";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

export const companyMenuItems: MenuItem[] = [
  { label: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" },
  { label: "Vagas", icon: <WorkIcon />, href: "/jobs" },
  { label: "Candidatos", icon: <PeopleIcon />, href: "/candidates" },
  { label: "Processos", icon: <AssessmentIcon />, href: "/processes" },
  { label: "Relatórios", icon: <TrendingUpIcon />, href: "/reports" },
  { label: "Empresa", icon: <BusinessIcon />, href: "/company" },
];
