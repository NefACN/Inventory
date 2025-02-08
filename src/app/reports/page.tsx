'use client';
import ReportsList from "@/components/main/ReportsList";
import { Box, Typography } from "@mui/material";
import ClientLayout from "@/components/layouts/ClientLayout";

export default function ReportsPage() {
  return (
    <ClientLayout>
    <Box sx={{ maxWidth: 900, mx: "auto", p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Reportes de Inventario
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Consulta y gestiona toda la información relevante sobre el inventario de tu sistema.
      </Typography>
      <ReportsList />
    </Box>
    </ClientLayout>
  );
}
