"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Box, Button } from "@mui/material";

import { routes } from "../libs/links";

export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <Box display="flex" gap={2}>
      {routes.map((route) => (
        <Button
          key={route.href}
          href={route.href}
          component={Link}
          variant={pathname === route.href ? "contained" : "text"}
        >
          {route.label}
        </Button>
      ))}
    </Box>
  );
};
