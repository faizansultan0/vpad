import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

const theme = createTheme({
  palette: {
    primary: { main: "#667eea", light: "#8093f8", dark: "#4650b5" },
    secondary: { main: "#764ba2", light: "#9333ea", dark: "#581c87" },
  },
  typography: { fontFamily: '"Inter", "system-ui", "sans-serif"' },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: "#333", color: "#fff", borderRadius: "10px" },
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
