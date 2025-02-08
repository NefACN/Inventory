import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

export async function GET() {
    try {
        const db = await getConnection();

        const [productos, stock, compras, ventas] = await Promise.all([
            db.query(`SELECT COUNT(*) FROM productos WHERE habilitado =  TRUE`), 
            db.query(`SELECT COALESCE(SUM(stock), 0) FROM productos WHERE habilitado = TRUE`), 
            db.query(`SELECT COALESCE(SUM(total), 0) FROM compras WHERE fechacompra >= NOW() - INTERVAL '30 days'`), 
            db.query(`SELECT COALESCE(SUM(total), 0) FROM ventas WHERE fechaventa >= NOW() - INTERVAL '30 days'`) 
        ]);

        return NextResponse.json({
            totalProductos: productos.rows[0].count,
            totalStock: stock.rows[0].coalesce,
            totalCompras: compras.rows[0].coalesce,
            totalVentas: ventas.rows[0].coalesce
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
    }
}
