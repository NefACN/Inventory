import React from 'react';
import { Card, CardContent, Typography, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

interface SummaryCardProps {
    totalPurchases: number;
    totalProducts: number;
    avgPurchasePerProduct: number;
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

export default function SummaryCard({ totalPurchases, totalProducts, avgPurchasePerProduct }: SummaryCardProps) {
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
                                Total de Compras
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {formatCurrency(totalPurchases)}
                            </Typography>
                        </StatBox>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <StatBox elevation={2}>
                            <Typography variant="h6" color="textSecondary">
                                Productos Comprados
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {(totalProducts || 0).toLocaleString()}
                            </Typography>
                        </StatBox>
                    </Grid>
                    <Grid item xs ={12} sm={4}>
                        <StatBox elevation={2}>
                            <Typography variant="h6" color="textSecondary">
                                Promedio de Compra por Producto
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {isNaN(avgPurchasePerProduct)
                                    ? formatCurrency(0) // Mostrar 0 si es NaN
                                    : formatCurrency(avgPurchasePerProduct)}
                            </Typography>
                        </StatBox>
                    </Grid>
                </Grid>
            </CardContent>
        </StyledCard>
    );
}