import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";

interface Product {
    idproducto: number;
    producto: string;
    cantidad_vendida: number;
    precio_promedio: string;
    ingresos_generados: string;
}

interface MostSoldSummaryProps {
    products: Product[];
}

const MostSoldSummary: React.FC<MostSoldSummaryProps> = ({ products }) => {
    // Calculate summary statistics
    const totalProducts = products.length;
    const totalItemsSold = products.reduce((sum, product) => sum + parseInt(String(product.cantidad_vendida), 10), 0);
    const totalRevenue = products.reduce((sum, product) => sum + parseFloat(product.ingresos_generados), 0);

    return (
        <Box sx={{ marginBottom: "25px", marginLeft: "25px", marginRight: "25px" }}>
            <Typography 
                variant="h5" 
                sx={{ marginBottom: "16px", fontWeight: "bold", color: "#333" }}
            >
                Resumen de Ventas
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            backgroundColor: '#f4f4f4' 
                        }}
                    >
                        <Typography variant="subtitle1" color="textSecondary">
                            Total de Productos
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {totalProducts}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            backgroundColor: '#f4f4f4' 
                        }}
                    >
                        <Typography variant="subtitle1" color="textSecondary">
                            Total de Artículos Vendidos
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {totalItemsSold}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 2, 
                            textAlign: 'center', 
                            backgroundColor: '#f4f4f4' 
                        }}
                    >
                        <Typography variant="subtitle1" color="textSecondary">
                            Ingresos Totales
                        </Typography>
                        <Typography variant="h6" color="primary">
                            {totalRevenue.toFixed(2)} Bs
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MostSoldSummary;