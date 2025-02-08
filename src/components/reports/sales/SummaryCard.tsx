import React from 'react';
import { Card, CardContent, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

interface SummaryCardProps {
    totalSales: number;
    totalProducts: number;
    avgSalePerProduct: number;
}

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    '& .MuiTypography-h4': {
        marginTop: theme.spacing(1),
    },
}));

const StatBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
}));

export default function SummaryCard({ totalSales, totalProducts, avgSalePerProduct }: SummaryCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
        }).format(amount);
    };

    return (
        <StyledCard>
            <CardContent>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <StatBox elevation={2}>
                            <Typography variant="h6" color="textSecondary">
                                Total de Ventas
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {formatCurrency(totalSales)}
                            </Typography>
                        </StatBox>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatBox elevation={2}>
                            <Typography variant="h6" color="textSecondary">
                                Productos Vendidos
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {totalProducts.toLocaleString()}
                            </Typography>
                        </StatBox>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatBox elevation={2}>
                            <Typography variant="h6" color="textSecondary">
                                Promedio por Producto
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {formatCurrency(avgSalePerProduct)}
                            </Typography>
                        </StatBox>
                    </Grid>
                </Grid>
            </CardContent>
        </StyledCard>
    );
}