'use client';
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import ClientLayout from "@/components/layouts/ClientLayout";
import SalesChart from "@/components/charts/SalesChart";
import ProductStockChart from "@/components/charts/ProductStockChart";
import DashboardSummary from "@/components/main/DashboardSummary";
import DashboardTables from "@/components/main/DashboardTables";

export default function HomePage() {
  return (
    <ClientLayout>
      <Box sx={{ padding: 3 }}>
        <DashboardSummary />
        <Grid container spacing={3} sx={{ marginTop: 2 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1, padding: 2 }}>
              <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                Tendencia de Ventas
              </Typography>
              <SalesChart />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 1, padding: 2 }}>
              <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                Stock de Productos
              </Typography>
              <ProductStockChart />
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ marginTop: 4 }}>
          <DashboardTables />
        </Box>
      </Box>
    </ClientLayout>
  );
}