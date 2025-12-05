import {
  TrendingUp,
  TrendingDown,
  Cancel,
  Refresh,
  PlayArrow,
} from "@mui/icons-material";

export const ACTION_CONFIG: Record<
  string,
  {
    color: "success" | "error" | "warning" | "info" | "primary";
    icon: React.ReactElement;
    label: string;
  }
> = {
  UPGRADED: {
    color: "success",
    icon: <TrendingUp />,
    label: "Upgrade",
  },
  DOWNGRADED: {
    color: "warning",
    icon: <TrendingDown />,
    label: "Downgrade",
  },
  CANCELED: {
    color: "error",
    icon: <Cancel />,
    label: "Cancelamento",
  },
  REACTIVATED: {
    color: "info",
    icon: <Refresh />,
    label: "Reativação",
  },
  CREATED: {
    color: "primary",
    icon: <PlayArrow />,
    label: "Início",
  },
  RENEWED: {
    color: "success",
    icon: <Refresh />,
    label: "Renovação",
  },
  EXPIRED: {
    color: "error",
    icon: <Cancel />,
    label: "Expirado",
  },
};
