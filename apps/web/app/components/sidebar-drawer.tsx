import { memo, useMemo } from "react";
import {
  Box,
  Chip,
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
import Link from "next/link";

import { Logo } from "@/app/components/logo";
import { UserType } from "../shared/types/user-type";

const drawerWidth = 340;

interface SidebarDrawerProps {
  menuItems: {
    label: string;
    icon: React.ReactNode;
    href: string;
  }[];
  userType: string | null;
  profile: {
    role?: string | null;
  } | null;
  firstName: string;
  handleLogout: () => void;
  config: {
    label: string;
  };
  currentPath?: string;
}

// Memoized menu item component
const MenuItem = memo(function MenuItem({
  item,
  isSelected,
}: {
  item: { label: string; icon: React.ReactNode; href: string };
  isSelected: boolean;
}) {
  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        href={item.href}
        selected={isSelected}
        prefetch={false}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} />
      </ListItemButton>
    </ListItem>
  );
});

export const SidebarDrawer = memo(function SidebarDrawer({
  menuItems,
  userType,
  profile,
  firstName,
  handleLogout,
  config,
  currentPath,
}: SidebarDrawerProps) {
  const chipColor = useMemo(
    () => (userType === UserType.CANDIDATE ? "primary" : "secondary"),
    [userType]
  );

  const drawerSx = useMemo(
    () => ({
      width: drawerWidth,
      flexShrink: 0,
      "& .MuiDrawer-paper": {
        width: drawerWidth,
        boxSizing: "border-box",
      },
    }),
    []
  );

  return (
    <Drawer sx={drawerSx} variant="permanent" anchor="left">
      <Toolbar className="flex items-center justify-between px-4">
        <Logo />
        <Chip label={config.label} color={chipColor} size="small" />
      </Toolbar>
      <Divider />
      <Box className="flex flex-col justify-between h-full p-2">
        <List>
          {menuItems.map((item) => (
            <MenuItem
              key={item.label}
              item={item}
              isSelected={currentPath === item.href}
            />
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
              Olá, <span className="font-bold">{firstName}</span>, bem-vindo(a)
              de volta!
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
});
