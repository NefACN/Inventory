"use client";

import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";

interface Stats {
    totalProductos: number;
    totalStock: number;
    totalCompras: number;
    totalVentas: number;
}

export default function DashboardSummary() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch("/api/dashboard/stats");
                if (!response.ok) throw new Error("Error fetching stats");
                const data: Stats = await response.json();
                setStats(data);
            } catch (error) {
                console.error("Error loading dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const cards = [
        { title: "Total Productos", value: stats?.totalProductos, icon: <InventoryIcon fontSize="large" />, color: "#3498db" },
        { title: "Stock Total", value: stats?.totalStock, icon: <ShoppingBasketIcon fontSize="large" />, color: "#2ecc71" },
        { title: "Compras (Último Mes)", value: `${stats?.totalCompras} Bs`, icon: <ShoppingCartIcon fontSize="large" />, color: "#f39c12" },
        { title: "Ventas (Último Mes)", value: `${stats?.totalVentas} Bs`, icon: <AttachMoneyIcon fontSize="large" />, color: "#e74c3c" },
    ];

    if (loading) return <CircularProgress />;

    return (
        <Grid container spacing={2}>
            {cards.map((card, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card sx={{ backgroundColor: card.color, color: "white", textAlign: "center" }}>
                        <CardContent>
                            {card.icon}
                            <Typography variant="h6">{card.title}</Typography>
                            <Typography variant="h4">{card.value}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}
