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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import exportExcel from "@/utils/exportExcel";
import exportToPDF from "@/utils/exportPdf";

interface Purchase {
    idcompra: number;
    fechacompra: string;
    total_compra: number;
    idproducto: number;
    producto: string;
    cantidad: number;
    precio_unitario: number;
    total_producto: number;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(2),
    maxHeight: '60vh',
    '& .MuiTableCell-head': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        fontWeight: 'bold',
    },
}));

export default function PurchasesTable({ data = [] }: { data: Purchase[] }) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
        }).format(amount);
    };
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleExportExcel = () => {
        exportExcel(data, 'Reporte de Compras');
    };

    const handleExportPDF = () => {
        const reportContent = document.getElementById('report-content');
        if (reportContent) {
            reportContent.style.display = 'block';
            reportContent.style.position = 'absolute';
            reportContent.style.top = '0';
            reportContent.style.left = '0';
            reportContent.style.width = '1000';

            exportToPDF('report-content', 'Reporte de Compras').then(() => {
                reportContent.style.display = 'none';
                reportContent.style.position = 'static';
                reportContent.style.width = 'auto';
            });
        }
    }

    return (
        <Paper>
            <div style={{ display: 'flex', gap: '8px', margin: '10px' }}>
                <Button onClick={handleExportExcel} variant="contained" color="success">
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
                            <TableCell>ID Compra</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Producto</TableCell>
                            <TableCell align="right">Cantidad</TableCell>
                            <TableCell align="right">Precio Unitario</TableCell>
                            <TableCell align="right">Total Producto</TableCell>
                            <TableCell align="right">Total Compra</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((purchase, index) => (
                                <TableRow key={`${purchase.idcompra}-${index}`} hover>
                                    <TableCell>{purchase.idcompra}</TableCell>
                                    <TableCell>{formatDate(purchase.fechacompra)}</TableCell>
                                    <TableCell>{purchase.producto}</TableCell>
                                    <TableCell align="right">{purchase.cantidad}</TableCell>
                                    <TableCell align="right">{formatCurrency(purchase.precio_unitario)}</TableCell>
                                    <TableCell align="right">{formatCurrency(purchase.total_producto)}</TableCell>
                                    <TableCell align="right">{formatCurrency(purchase.total_compra)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No hay datos disponibles
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </StyledTableContainer>

            <div id="report-content" style={{ display: 'none' }}>
                <div>
                    <h1><center>REPORTE DE COMPRAS</center></h1>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                            <th style={{ border: '1px solid #999', padding: '8px' }}>ID Compra</th>
                            <th style={{ border: '1px solid #999', padding: '8px' }}>Fecha</th>
                            <th style={{ border: '1px solid #999', padding: '8px' }}>Producto</th>
                            <th style={{ border: '1px solid #999', padding: '8px' }}>Cantidad</th>
                            <th style={{ border: '1px solid #999', padding: '8px', textAlign: "right" }}>Precio Unitario</th>
                            <th style={{ border: '1px solid #999', padding: '8px', textAlign: "right" }}>Total Producto</th>
                            <th style={{ border: '1px solid #999', padding: '8px', textAlign: "right" }}>Total Compra</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((purchase, index) => (
                            <tr key={`${purchase.idcompra}-${index}`}>
                                <td style={{ border: '1px solid #999', padding: '8px' }}>{purchase.idcompra}</td>
                                <td style={{ border: '1px solid #999', padding: '8px' }}>{formatDate(purchase.fechacompra)}</td>
                                <td style={{ border: '1px solid #999', padding: '8px' }}>{purchase.producto}</td>
                                <td style={{ border: '1px solid #999', padding: '8px', textAlign: "right" }}>{purchase.cantidad}</td>
                                <td style={{ border: '1px solid #999', padding: '8px', textAlign: "right" }}>{formatCurrency(purchase.precio_unitario)}</td>
                                <td style={{ border: '1px solid #999', padding: '8px', textAlign: "right" }}>{formatCurrency(purchase.total_producto)}</td>
                                <td style={{ border: '1px solid #999', padding: '8px', textAlign: "right" }}>{formatCurrency(purchase.total_compra)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Paper>
    );
}