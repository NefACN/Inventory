"use client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { theme } from "@/app/theme/theme";
import Sidebar from "@/components/main/SideBar";
import Toolbar from "@mui/material/Toolbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Sidebar fijo */}
        <Box sx={{ flexShrink: 0 }}>
          <Sidebar />
        </Box>

        {/* Contenido principal con desplazamiento habilitado */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            p: 3,
            width: "100%",
            overflowY: "auto", // Habilita el desplazamiento vertical
          }}
        >
          <Toolbar sx={{ minHeight: 64 }} /> {/* Mantiene el espacio del AppBar */}
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
