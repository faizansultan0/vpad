import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import App from "./App";
import useThemeStore from "./store/themeStore";
import "./index.css";

/* ── Shared MUI config ── */
const sharedConfig = {
  typography: {
    fontFamily: '"Inter", "system-ui", "sans-serif"',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
};

/* ── Dark MUI theme ── */
const darkTheme = createTheme({
  ...sharedConfig,
  palette: {
    mode: "dark",
    primary: {
      main: "#8b5cf6",
      light: "#a78bfa",
      dark: "#6d28d9",
    },
    secondary: {
      main: "#667eea",
      light: "#8093f8",
      dark: "#4650b5",
    },
    background: {
      default: "transparent",
      paper: "rgba(22, 14, 48, 0.7)",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
  },
  components: {
    ...sharedConfig.components,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "rgba(22, 14, 48, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: "rgba(22, 14, 48, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: "rgba(22, 14, 48, 0.9)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
      },
    },
  },
});

/* ── Light MUI theme ── */
const lightTheme = createTheme({
  ...sharedConfig,
  palette: {
    mode: "light",
    primary: {
      main: "#7c3aed",
      light: "#8b5cf6",
      dark: "#6d28d9",
    },
    secondary: {
      main: "#667eea",
      light: "#8093f8",
      dark: "#4650b5",
    },
    background: {
      default: "transparent",
      paper: "rgba(255, 255, 255, 0.8)",
    },
    text: {
      primary: "#1e1042",
      secondary: "#5b4a7c",
    },
  },
  components: {
    ...sharedConfig.components,
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(139, 92, 246, 0.12)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(139, 92, 246, 0.15)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(139, 92, 246, 0.15)",
        },
      },
    },
  },
});

/* ── Toast style sets ── */
const darkToastStyle = {
  background: "rgba(22, 14, 48, 0.9)",
  color: "#f1f5f9",
  borderRadius: "12px",
  border: "1px solid rgba(139, 92, 246, 0.2)",
  backdropFilter: "blur(12px)",
};

const lightToastStyle = {
  background: "rgba(255, 255, 255, 0.92)",
  color: "#1e1042",
  borderRadius: "12px",
  border: "1px solid rgba(139, 92, 246, 0.2)",
  backdropFilter: "blur(12px)",
};

/* ── Wrapper that reacts to theme store ── */
function ThemeWrapper() {
  const resolved = useThemeStore((s) => s.resolved);
  const muiTheme = resolved === "dark" ? darkTheme : lightTheme;
  const toastStyle = resolved === "dark" ? darkToastStyle : lightToastStyle;

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: toastStyle,
        }}
      />
    </ThemeProvider>
  );
}

/* ── Initialize theme on app boot ── */
useThemeStore.getState().init();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeWrapper />
    </BrowserRouter>
  </React.StrictMode>
);
