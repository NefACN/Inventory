import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

interface ProductStock {
    nombre: string,
    stock: number,
}

export async function GET() {
    try{
        const query = `
            SELECT nombre, stock
            FROM productos
            WHERE habilitado = TRUE
            ORDER BY stock DESC;
        `;
        const db = await getConnection();
        const {rows} = await db.query(query);
        return NextResponse.json(rows as ProductStock[]);
    }catch (error) {
        console.error("Error fetching stock", error);
        return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
    }
}
