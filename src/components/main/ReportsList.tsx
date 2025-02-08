import React from "react";
import ReportCard from "./ReportCard";
import { Grid } from "@mui/material";
import {
  AlertTriangle,
  ShoppingCart,
  CalendarDays,
  DollarSign,
  Repeat,
  Archive,
} from "lucide-react";

const ReportsList = () => {
  const reports = [
    { icon: <AlertTriangle />, title: "Stock Bajo", description: "Productos con niveles de stock críticos.", route: "/reports/low_stock" },
    { icon: <ShoppingCart />, title: "Más Vendido", description: "Listado de los productos más vendidos.", route: "/reports/most_sold" },
    { icon: <CalendarDays />, title: "Ventas por Fecha", description: "Reporte de ventas en un rango de fechas.", route: "/reports/sales" },
    { icon: <DollarSign />, title: "Compras por Fecha", description: "Reporte de compras realizadas en un período.", route: "/reports/purchases" },
    { icon: <Repeat />, title: "Transacciones", description: "Registro detallado de todas las transacciones.", route: "/reports/transactions" },
    { icon: <Archive />, title: "Resumen del Inventario", description: "Estado general del inventario.", route: "/reports/inventory" },
  ];

  return (
    <Grid container spacing={3}>
      {reports.map((report, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <ReportCard {...report} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ReportsList;
