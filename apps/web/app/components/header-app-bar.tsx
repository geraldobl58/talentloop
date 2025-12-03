import { AppBar, Box, Toolbar, Typography } from "@mui/material";

const drawerWidth = 340;

interface HeaderAppBarProps {
  config: {
    dashboardTitle: string;
    dashboardDescription: string;
  };
}

export const HeaderAppBar = ({ config }: HeaderAppBarProps) => {
  return (
    <AppBar
      position="fixed"
      sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
    >
      <Toolbar>
        <Box>
          <Typography variant="h6" noWrap component="div">
            {config.dashboardTitle}
          </Typography>
          <Typography variant="body2">{config.dashboardDescription}</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
