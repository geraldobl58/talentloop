import {
  Bookmark as BookmarkIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

export const candidateMenuItems: MenuItem[] = [
  { label: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" },
  { label: "Buscar Vagas", icon: <SearchIcon />, href: "/jobs" },
  { label: "Candidaturas", icon: <DescriptionIcon />, href: "/applications" },
  { label: "Vagas Salvas", icon: <BookmarkIcon />, href: "/saved-jobs" },
  { label: "Entrevistas", icon: <EventIcon />, href: "/interviews" },
  { label: "Meu Perfil", icon: <PersonIcon />, href: "/profile" },
];
