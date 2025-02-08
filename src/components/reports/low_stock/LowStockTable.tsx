import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    Button,
} from "@mui/material";
import exportExcel from "@/utils/exportExcel";
import exportToPDF from "@/utils/exportPdf";

interface Product {
    idproducto: number;
    producto: string;
    stock: number;
    preciocompra: number;
    precioventa: number;
    categoria: string | null;
}

interface LowStockTableProps {
    products: Product[];
}

const LowStockTable = ({ products }: LowStockTableProps) => {
    const handleExportExcel = () => {
        exportExcel(products, "Productos con bajo stock");
    };

    const handleExportPDF = () => {
        const reportContent = document.getElementById("report-content");
        if (reportContent) {
            reportContent.style.display = "block";
            reportContent.style.position = "absolute";
            reportContent.style.top = "0";
            reportContent.style.left = "0";
            reportContent.style.zIndex = "1000";

            exportToPDF("report-content", "Productos con bajo stock")
                .then(() => {
                    reportContent.style.display = "none";
                })
                .catch((error) => {
                    console.error("Error exporting PDF:", error);
                    alert("Hubo un error al generar el PDF.");
                    reportContent.style.display = "none";
                });
        }
    };

    return (
        <Box sx={{ marginTop: "25px", marginLeft: "25px", marginRight: "25px" }}>
            <Typography
                variant="h5"
                sx={{ marginBottom: "16px", fontWeight: "bold", color: "#333" }}
            >
                Productos con stock bajo
            </Typography>
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
                            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Stock</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Precio Compra</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Precio Venta</TableCell>
                            <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Categoría</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.idproducto}>
                                <TableCell>{product.idproducto}</TableCell>
                                <TableCell>{product.producto}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell>{product.preciocompra.toFixed(2)} Bs</TableCell>
                                <TableCell>{product.precioventa.toFixed(2)} Bs</TableCell>
                                <TableCell>{product.categoria || "Sin Categoría"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Contenido oculto para exportar a PDF */}
            <div id="report-content" style={{ display: "none" }}>
                <div>
                    <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
                        Productos con stock bajo
                    </h1>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Producto</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Stock</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                                Precio Compra
                            </th>
                            <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                                Precio Venta
                            </th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Categoría</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.idproducto}>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    {product.idproducto}
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    {product.producto}
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    {product.stock}
                                </td>
                                <td
                                    style={{
                                        border: "1px solid #ddd",
                                        padding: "8px",
                                        textAlign: "right",
                                    }}
                                >
                                    {product.preciocompra.toFixed(2)} Bs
                                </td>
                                <td
                                    style={{
                                        border: "1px solid #ddd",
                                        padding: "8px",
                                        textAlign: "right",
                                    }}
                                >
                                    {product.precioventa.toFixed(2)} Bs
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    {product.categoria || "Sin Categoría"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Box>
    );
};

export default LowStockTable;
