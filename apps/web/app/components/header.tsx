"use client";

import Link from "next/link";

import { Box, Button, Container } from "@mui/material";

import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

export const Header = () => {
  return (
    <Box
      component="header"
      sx={{
        py: 3,
        borderBottom: "1px solid",
        borderColor: "grey.200",
        bgcolor: "white",
      }}
    >
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Link href="/">
            <Logo />
          </Link>
          <NavLinks />
          <Button variant="outlined" href="/auth/sign-in" component={Link}>
            Já tenho conta
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
