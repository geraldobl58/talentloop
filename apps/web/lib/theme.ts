"use client";

import { createTheme, ThemeOptions } from "@mui/material/styles";

// Paleta violeta/roxo/azul para TalentLoop
const themeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#7c3aed", // Violet-600
      light: "#a78bfa", // Violet-400
      dark: "#5b21b6", // Violet-800
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#3b82f6", // Blue-500
      light: "#60a5fa", // Blue-400
      dark: "#1d4ed8", // Blue-700
      contrastText: "#ffffff",
    },
    background: {
      default: "#faf5ff", // Very light violet
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2937", // Gray-800
      secondary: "#6b7280", // Gray-500
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f59e0b",
    },
    info: {
      main: "#6366f1", // Indigo-500
    },
    success: {
      main: "#10b981",
    },
  },
  typography: {
    fontFamily:
      'var(--font-montserrat-sans), "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
          },
        },
        outlined: {
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(124, 58, 237, 0.08)",
          border: "1px solid rgba(124, 58, 237, 0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover fieldset": {
              borderColor: "#a78bfa",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#7c3aed",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        colorPrimary: {
          background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)",
          boxShadow: "0 2px 12px rgba(124, 58, 237, 0.2)",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: "#e9d5ff", // Violet-200
        },
        bar: {
          borderRadius: 4,
          background: "linear-gradient(90deg, #7c3aed 0%, #3b82f6 100%)",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
        },
      },
    },
  },
};

// Tema dark
const darkThemeOptions: ThemeOptions = {
  ...themeOptions,
  palette: {
    mode: "dark",
    primary: {
      main: "#a78bfa", // Violet-400
      light: "#c4b5fd", // Violet-300
      dark: "#7c3aed", // Violet-600
      contrastText: "#0f0f0f",
    },
    secondary: {
      main: "#60a5fa", // Blue-400
      light: "#93c5fd", // Blue-300
      dark: "#3b82f6", // Blue-500
      contrastText: "#0f0f0f",
    },
    background: {
      default: "#0f0a1a", // Dark violet
      paper: "#1a1025", // Dark purple
    },
    text: {
      primary: "#f3f4f6", // Gray-100
      secondary: "#9ca3af", // Gray-400
    },
    error: {
      main: "#f87171",
    },
    warning: {
      main: "#fbbf24",
    },
    info: {
      main: "#818cf8", // Indigo-400
    },
    success: {
      main: "#34d399",
    },
  },
};

export const lightTheme = createTheme(themeOptions);
export const darkTheme = createTheme(darkThemeOptions);

// Export default theme
export default lightTheme;
