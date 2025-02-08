'use client';
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
  AppBar,
  Toolbar,
  ListItemButton,
  Box,
} from "@mui/material";
import {
  Inventory2Outlined,
  CategoryOutlined,
  AttachMoneyOutlined,
  ShoppingCartOutlined,
  LocalShippingOutlined,
  BarChartOutlined,
  Home,
} from "@mui/icons-material";

interface Route {
  label: string;
  icon: React.ReactElement;
  path: string;
}

const routes: Route[] = [
  { label: "Inicio", icon: <Home />, path: "/" },
  { label: "Productos", icon: <Inventory2Outlined />, path: "/products" },
  { label: "Categorías", icon: <CategoryOutlined />, path: "/categories" },
  { label: "Ventas", icon: <AttachMoneyOutlined />, path: "/sales" },
  { label: "Compras", icon: <ShoppingCartOutlined />, path: "/purchases" },
  { label: "Proveedores", icon: <LocalShippingOutlined />, path: "/suppliers" },
  { label: "Reportes", icon: <BarChartOutlined />, path: "/reports" }
];

const drawerWidth = 240;

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <>
      {/* Barra superior */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "background.paper",
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.08)", // Sombra sutil
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)", // Borde sutil
          transition: "width 0.3s ease-in-out, margin-left 0.3s ease-in-out", // Animación suave
        }}
      >
        <Toolbar sx={{ px: 4 }}> {/* Más espacio en los lados */}
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            color="primary" 
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar estático */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px',
          },
        }}
      >
        <List>
          {routes.map(({ label, icon, path }) => (
            <Link 
              key={label} 
              href={path} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemButton
                selected={pathname === path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  borderRadius: '8px',
                  margin: '4px 8px',
                  width: 'auto',
                }}
              >
                <ListItemIcon sx={{ 
                  color: pathname === path ? 'primary.contrastText' : 'inherit'
                }}>
                  {icon}
                </ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Drawer>

      {/* Contenido ajustado para no quedar detrás del sidebar */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: `${drawerWidth}px`, mt: '64px' }}>
        <Toolbar /> {/* Espaciador para que el contenido no se superponga con el AppBar */}
      </Box>
    </>
  );
};

export default Sidebar;
