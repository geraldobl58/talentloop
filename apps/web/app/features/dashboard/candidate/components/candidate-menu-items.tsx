import {
  AddCard as AddCardIcon,
  Bookmark as BookmarkIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { createElement } from "react";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

// Função para criar menu items com ícones lazy
const createMenuItem = (
  label: string,
  IconComponent: React.ElementType,
  href: string
): MenuItem => ({
  label,
  icon: createElement(IconComponent),
  href,
});

export const candidateMenuItems: MenuItem[] = [
  createMenuItem("Dashboard", DashboardIcon, "/dashboard"),
  createMenuItem("Buscar Vagas", SearchIcon, "/jobs"),
  createMenuItem("Candidaturas", DescriptionIcon, "/applications"),
  createMenuItem("Vagas Salvas", BookmarkIcon, "/saved-jobs"),
  createMenuItem("Entrevistas", EventIcon, "/interviews"),
  createMenuItem("Meu Plano", AddCardIcon, "/my-plans"),
  createMenuItem("Meu Perfil", PersonIcon, "/profile"),
];
