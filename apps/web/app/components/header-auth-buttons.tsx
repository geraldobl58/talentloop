"use client";

import Link from "next/link";
import { Box, Button } from "@mui/material";

interface HeaderAuthButtonsProps {
  isLoggedIn: boolean;
}

export const HeaderAuthButtons = ({ isLoggedIn }: HeaderAuthButtonsProps) => {
  if (isLoggedIn) {
    return (
      <Button variant="outlined" href="/dashboard" component={Link}>
        Ir para o painel
      </Button>
    );
  }

  return (
    <Box display="flex" gap={2}>
      <Button variant="outlined" href="/plans" component={Link}>
        Assinar
      </Button>
      <Button variant="outlined" href="/auth/sign-in" component={Link}>
        Entrar
      </Button>
    </Box>
  );
};
