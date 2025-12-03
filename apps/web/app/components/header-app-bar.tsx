import { AppBar, Avatar, Box, Toolbar, Typography } from "@mui/material";
import { useProfile } from "../hooks/use-profile";

const drawerWidth = 340;

interface HeaderAppBarProps {
  config: {
    dashboardTitle: string;
    dashboardDescription: string;
  };
}

export const HeaderAppBar = ({ config }: HeaderAppBarProps) => {
  const { data } = useProfile();

  return (
    <AppBar
      position="fixed"
      sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
    >
      <Toolbar className="flex items-center justify-between ">
        <Box>
          <Typography variant="h6" noWrap component="div">
            {config.dashboardTitle}
          </Typography>
          <Typography variant="body2">{config.dashboardDescription}</Typography>
        </Box>
        <Box>
          {data?.avatar && <Avatar alt={data.name} src={data.avatar} />}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
