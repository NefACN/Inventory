"use client";

import React, { useEffect, useState } from "react";
import TransactionsTable from "@/components/reports/transaction/TransactionsTable";
import { CircularProgress, Box, Alert, TextField, Button, Typography } from "@mui/material";
import ClientLayout from "@/components/layouts/ClientLayout";

interface Transaction {
    tipo: string;
    fecha: string;
    monto: number;
}

const TransactionsReportPage: React.FC = () => {
    const today = new Date().toISOString().split("T")[0];
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>(today);
    const [endDate, setEndDate] = useState<string>(today);

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/reports/transactions?startDate=${startDate}&endDate=${endDate}`
            );
            if (!response.ok) {
                throw new Error("Error al obtener las transacciones");
            }
            const data: Transaction[] = await response.json();
            setTransactions(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error desconocido");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch transactions on initial load
        fetchTransactions();
    }, []);

    const handleFetch = () => {
        if (!startDate || !endDate) {
            setError("Las fechas no pueden estar vacías");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setError("La fecha de inicio no puede ser mayor que la fecha de fin");
            return;
        }
        fetchTransactions();
    };

    return (
        <ClientLayout>
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Reporte de Transacciones
            </Typography>
            <Box display="flex" gap={2} marginBottom={3}>
                <TextField
                    label="Fecha de inicio"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Fecha de fin"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <Button variant="contained" color="primary" onClick={handleFetch}>
                    Consultar
                </Button>
            </Box>
            {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            )}
            {error && (
                <Box marginBottom={3}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}
            {!loading && !error && transactions.length > 0 && (
                <TransactionsTable transactions={transactions} />
            )}
            {!loading && !error && transactions.length === 0 && (
                <Alert severity="info">No se encontraron transacciones en el rango de fechas.</Alert>
            )}
        </Box>
        </ClientLayout>
    );
};

export default TransactionsReportPage;
