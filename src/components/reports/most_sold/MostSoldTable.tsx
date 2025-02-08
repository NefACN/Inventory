import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Button
} from "@mui/material";
import exportExcel from "@/utils/exportExcel";
import exportToPDF from "@/utils/exportPdf";

interface Product {
    idproducto: number;
    producto: string;
    cantidad_vendida: number;
    precio_promedio: string;
    ingresos_generados: string;
}

interface MostSoldTableProps {
    products: Product[];
}

const MostSoldTable = ({ products }: MostSoldTableProps) => {
    const handleExportExcel = () => {
        exportExcel(products, "Productos más vendidos");
    };

    const handleExportPDF = () => {
        const reportContent = document.getElementById("report-content");
        if (reportContent) {
            reportContent.style.display = 'block';
            reportContent.style.position = 'absolute';
            reportContent.style.top = '0';
            reportContent.style.left = '0';
            reportContent.style.width = '100%';
            exportToPDF("report-content", "Productos más vendidos").then(() => {
                reportContent.style.display = 'none';
                reportContent.style.position = 'static';
                reportContent.style.zIndex = 'auto';
            });
        }
    };

    return (
        <Box sx={{ marginTop: "25px", marginLeft: "25px", marginRight: "25px"}}>
            <div style={{ display: "flex", gap: "8px", margin: "10px" }}>
                <Button onClick={handleExportExcel} variant="contained" color="success">
                    Exportar a Excel
                </Button>
                <Button onClick={handleExportPDF} variant="contained" color="secondary">
                    Exportar a PDF
                </Button>
            </div>
            <TableContainer component={Paper} sx={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#1976d2" }}>
                            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Producto</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Total Vendido</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Precio promedio</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Ingresos Generados</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.isArray(products) && products.length > 0 ? (
                            products.map((product, index) => (
                                <TableRow key={`${product.idproducto}-${index}`}>
                                    <TableCell>{product.idproducto}</TableCell>
                                    <TableCell>{product.producto}</TableCell>
                                    <TableCell>{product.cantidad_vendida}</TableCell>
                                    <TableCell>{product.precio_promedio}</TableCell>
                                    <TableCell>{product.ingresos_generados} Bs</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No se encontraron datos
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <div id="report-content" style={{ display: "none" }}>
                <div><h1><center>PRODUCTOS MAS VENDIDOS</center></h1></div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>ID</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>Producto</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right"}}>Total Vendido</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px", textAlign:"right"}}>Precio promedio</td>
                            <td style={{  border: "1px solid #ddd", padding: "8px", textAlign:"right"}}>Ingresos Generados</td>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(products) && products.length > 0 ? (
                            products.map((product, index) => (
                                <tr key={`${product.idproducto}-${index}`}>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.idproducto}</td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.producto}</td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>{product.cantidad_vendida}</td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>{product.precio_promedio}</td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>{product.ingresos_generados} Bs</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                                    No se encontraron datos
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Box>
    );
};
export default MostSoldTable;