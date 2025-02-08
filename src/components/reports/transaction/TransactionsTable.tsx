import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Box,
} from "@mui/material";
import exportExcel from "@/utils/exportExcel";
import exportToPDF from "@/utils/exportPdf";

interface Transaction {
    tipo: string;
    fecha: string;
    monto: number;
}

interface TransactionsTableProps {
    transactions: Transaction[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
    const handleExportExcel = () => {
        exportExcel(transactions, "Reporte de Transacciones");
    };

    const handleExportPDF = () => {
        const reportContent = document.getElementById("report-content");
        if (reportContent) {
            reportContent.style.display = "block";
            reportContent.style.position = "absolute";
            reportContent.style.top = "0";
            reportContent.style.left = "0";
            reportContent.style.zIndex = "1000";

            exportToPDF("report-content", "Reporte de Transacciones").then(() => {
                reportContent.style.display = "none";
                reportContent.style.position = "static";
                reportContent.style.zIndex = "auto";
            });
        }
    };

    return (
        <Box sx={{ marginTop: "25px", marginLeft: "25px", marginRight: "25px" }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    margin: "16px 0",
                }}
            >
                <Button
                    onClick={handleExportExcel}
                    variant="contained"
                    color="success"
                    aria-label="Exportar a Excel"
                >
                    Exportar a Excel
                </Button>
                <Button
                    onClick={handleExportPDF}
                    variant="contained"
                    color="secondary"
                    aria-label="Exportar a PDF"
                >
                    Exportar a PDF
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#1976d2" }}>
                            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                                Tipo
                            </TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                                Fecha
                            </TableCell>
                            <TableCell align="right" sx={{ color: "#fff", fontWeight: "bold" }}>
                                Monto (Bs)
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((transaction, index) => (
                            <TableRow key={index}>
                                <TableCell>{transaction.tipo}</TableCell>
                                <TableCell>
                                    {new Date(transaction.fecha).toLocaleDateString("es-ES")}
                                </TableCell>
                                <TableCell align="right">
                                    {transaction.monto.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <div id="report-content" style={{ display: "none" }}>
                <h2>Reporte de Transacciones</h2>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f5f5f5" }}>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Tipo</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Fecha</th>
                            <th
                                style={{
                                    border: "1px solid #ddd",
                                    padding: "8px",
                                    textAlign: "right",
                                }}
                            >
                                Monto (Bs)
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction, index) => (
                            <tr key={index}>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    {transaction.tipo}
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    {new Date(transaction.fecha).toLocaleDateString("es-ES")}
                                </td>
                                <td
                                    style={{
                                        border: "1px solid #ddd",
                                        padding: "8px",
                                        textAlign: "right",
                                    }}
                                >
                                    {transaction.monto.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Box>
    );
};

export default TransactionsTable;
