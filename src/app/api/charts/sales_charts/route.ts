import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

interface SaleChart {
    fechaventa: string;
    total_ventas: number;
}

export async function GET() {
    try {
        const query = `
            SELECT fechaventa, SUM(total) AS total_ventas
            FROM ventas
            WHERE habilitado = FALSE
            GROUP BY fechaventa
            ORDER BY fechaventa;
        `;

        const db = await getConnection();
        const { rows } = await db.query(query);

        return NextResponse.json(rows as SaleChart[]);
    } catch (error) {
        console.error("Error fetching sales chart", error);
        return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
    }
}
