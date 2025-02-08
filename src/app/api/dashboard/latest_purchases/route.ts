import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

export async function GET() {
    try {
        const db = await getConnection();
        const query = `
            SELECT c.idcompra, p.nombre AS proveedor, c.fechacompra, c.total
            FROM compras c
            JOIN proveedores p ON c.idproveedor = p.idproveedor
            ORDER BY c.fechacompra DESC
            LIMIT 5;
        `;
        const { rows } = await db.query(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching latest purchases:", error);
        return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
    }
}
