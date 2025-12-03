import Link from "next/link";
import { cookies } from "next/headers";

import { Box, Container } from "@mui/material";

import { Logo } from "./logo";
import { NavLinks } from "./nav-links";
import { HeaderAuthButtons } from "./header-auth-buttons";
import { APP_CONSTANTS } from "../libs/constants";

export const Header = async () => {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get(APP_CONSTANTS.COOKIES.ACCESS_TOKEN)
    ?.value;

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
          <HeaderAuthButtons isLoggedIn={isLoggedIn} />
        </Box>
      </Container>
    </Box>
  );
};
