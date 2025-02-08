import React from "react";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    TableContainer,
    Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import exportExcel from "@/utils/exportExcel";
import exportToPDF from "@/utils/exportPdf";

interface Sale {
    idventa: number;
    idproducto: number;
    fechaventa: string;
    producto: string;
    cantidad: number;
    precio_unitario: number;
    total_producto: number;
    total_venta: number;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(2),
    maxHeight: "60vh",
    "& .MuiTableCell-head": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        fontWeight: "bold",
    },
}));

export default function SalesTable({ data }: { data: Sale[] }) {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("es-BO", {
            style: "currency",
            currency: "BOB",
        }).format(amount);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("es-BO", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const handleExport = () => {
        exportExcel(data, "Reporte de Ventas");
    };
    
    const handleExportPDF = () => {
        const reportContent = document.getElementById("report-content");
        if (reportContent) {
            reportContent.style.display = 'block';
            reportContent.style.position = 'absolute';
            reportContent.style.top = '0';
            reportContent.style.left = '0';
            reportContent.style.zIndex = '1000';
    
            exportToPDF("report-content", "Reporte de Ventas").then(() => {
                reportContent.style.display = 'none';
                reportContent.style.position = 'static';
                reportContent.style.zIndex = 'auto';
            });
        }
    };
    return (
        <Paper>
            <div style={{ display: "flex", gap: "8px", margin: "10px" }}>
                <Button onClick={handleExport} variant="contained" color="success">
                    Exportar a Excel
                </Button>
                <Button onClick={handleExportPDF} variant="contained" color="secondary">
                    Exportar a PDF
                </Button>
            </div>
            <StyledTableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID Venta</TableCell>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Producto</TableCell>
                                <TableCell align="right">Cantidad</TableCell>
                                <TableCell align="right">Precio Unitario</TableCell>
                                <TableCell align="right">Total Producto</TableCell>
                                <TableCell align="right">Total Venta</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.length > 0 ? (
                                data.map((sale, index) => (
                                    <TableRow key={`${sale.idventa}-${index}`} hover>
                                        <TableCell>{sale.idventa}</TableCell>
                                        <TableCell>{formatDate(sale.fechaventa)}</TableCell>
                                        <TableCell>{sale.producto}</TableCell>
                                        <TableCell align="right">{sale.cantidad}</TableCell>
                                        <TableCell align="right">{formatCurrency(sale.precio_unitario)}</TableCell>
                                        <TableCell align="right">{formatCurrency(sale.total_producto)}</TableCell>
                                        <TableCell align="right">{formatCurrency(sale.total_venta)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay datos para mostrar.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            {/* Contenedor específico para exportar */}
            <div id="report-content" style={{ display: "none" }}>
                <div>
                    <h1><center>REPORTE DE VENTAS</center></h1>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID Venta</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Fecha</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Producto</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Cantidad</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Precio Unitario</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Total Producto</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Total Venta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((sale, index) => (
                            <tr key={`${sale.idventa}-${index}`} style={{ borderBottom: "1px solid #ddd" }}>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{sale.idventa}</td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{formatDate(sale.fechaventa)}</td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{sale.producto}</td>
                                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>{sale.cantidad}</td>
                                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>{formatCurrency(sale.precio_unitario)}</td>
                                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>{formatCurrency(sale.total_producto)}</td>
                                <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>{formatCurrency(sale.total_venta)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </Paper>
    );
}
