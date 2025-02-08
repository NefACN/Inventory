import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

export async function GET() {
    try {
        const db = await getConnection();
        const query = `
            SELECT idproducto, nombre, stock
            FROM productos
            WHERE stock < 5 AND habilitado = TRUE
            ORDER BY stock ASC;
        `;
        const { rows } = await db.query(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching low stock products:", error);
        return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
    }
}
