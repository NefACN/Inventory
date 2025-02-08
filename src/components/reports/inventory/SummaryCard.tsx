import React from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";

// Interfaz para las props del resumen
interface SummaryProps {
    totalProducts: number;
    totalStock: number;
    totalValuePurchase: number;
    totalValueSale: number;
}

const SummaryCard = ({
    totalProducts,
    totalStock,
    totalValuePurchase,
    totalValueSale,
}: SummaryProps) => {
    return (
        <Card
            sx={{
                margin: "16px 0",
                padding: "16px",
                backgroundColor: "#f5f5f5",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
            }}
        >
            <CardContent>
                <Typography
                    variant="h5"
                    sx={{
                        marginBottom: "16px",
                        fontWeight: "bold",
                        color: "#333",
                        textAlign: "center",
                    }}
                >
                    Resumen de Inventario
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <Box
                            sx={{
                                textAlign: "center",
                                padding: "8px",
                                borderRadius: "8px",
                                backgroundColor: "#e3f2fd",
                            }}
                        >
                            <Typography variant="subtitle1" color="primary">
                                Total Productos
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {totalProducts}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box
                            sx={{
                                textAlign: "center",
                                padding: "8px",
                                borderRadius: "8px",
                                backgroundColor: "#e8f5e9",
                            }}
                        >
                            <Typography variant="subtitle1" color="success.main">
                                Total Stock
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {totalStock}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box
                            sx={{
                                textAlign: "center",
                                padding: "8px",
                                borderRadius: "8px",
                                backgroundColor: "#fff3e0",
                            }}
                        >
                            <Typography variant="subtitle1" color="warning.main">
                                Valor de Compra
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {totalValuePurchase.toFixed(2)} Bs
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box
                            sx={{
                                textAlign: "center",
                                padding: "8px",
                                borderRadius: "8px",
                                backgroundColor: "#ffebee",
                            }}
                        >
                            <Typography variant="subtitle1" color="error.main">
                                Valor de Venta
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {totalValueSale.toFixed(2)} Bs
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default SummaryCard;
