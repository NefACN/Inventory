"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Box, Grid } from "@mui/material";

interface Product {
    idproducto: number;
    nombre: string;
    stock: number;
}

interface Purchase {
    idcompra: number;
    proveedor: string;
    fechacompra: string;
    total: number;
}

export default function DashboardTables() {
    const [lowStock, setLowStock] = useState<Product[]>([]);
    const [latestPurchases, setLatestPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [lowStockRes, purchasesRes] = await Promise.all([
                    fetch("/api/dashboard/low_stock"),
                    fetch("/api/dashboard/latest_purchases"),
                ]);

                if (!lowStockRes.ok || !purchasesRes.ok) throw new Error("Error fetching data");

                const lowStockData: Product[] = await lowStockRes.json();
                const purchasesData: Purchase[] = await purchasesRes.json();

                setLowStock(lowStockData);
                setLatestPurchases(purchasesData);
            } catch (error) {
                console.error("Error loading dashboard tables:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <CircularProgress />;

    return (
        <Box sx={{ padding: 2 }}>
        <Grid container spacing={3}>
          {/* Tabla de Productos con Stock Bajo */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2, color: "text.primary" }}>
              Productos con Stock Bajo
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "primary.main" }}>
                  <TableRow>
                    <TableCell sx={{ color: "common.white", fontWeight: "bold" }}>Producto</TableCell>
                    <TableCell sx={{ color: "common.white", fontWeight: "bold" }}>Stock</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStock.map((product) => (
                    <TableRow key={product.idproducto} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell>{product.nombre}</TableCell>
                      <TableCell
                        sx={{
                          color: product.stock < 3 ? "error.main" : "warning.main",
                          fontWeight: "bold",
                        }}
                      >
                        {product.stock}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
  
          {/* Tabla de Últimas Compras */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2, color: "text.primary" }}>
              Últimas Compras
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "primary.main" }}>
                  <TableRow>
                    <TableCell sx={{ color: "common.white", fontWeight: "bold" }}>ID Compra</TableCell>
                    <TableCell sx={{ color: "common.white", fontWeight: "bold" }}>Proveedor</TableCell>
                    <TableCell sx={{ color: "common.white", fontWeight: "bold" }}>Fecha</TableCell>
                    <TableCell sx={{ color: "common.white", fontWeight: "bold" }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestPurchases.map((purchase) => (
                    <TableRow key={purchase.idcompra} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell>{purchase.idcompra}</TableCell>
                      <TableCell>{purchase.proveedor}</TableCell>
                      <TableCell>{new Date(purchase.fechacompra).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>{Number(purchase.total).toFixed(2)} Bs</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Box>
    );
  };