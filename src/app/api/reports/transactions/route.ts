import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

interface RawTransaction {
    tipo: string;
    fecha: string;
    monto: string;
}

interface Transaction {
    tipo: string;
    fecha: string; 
    monto: number;
}

export async function GET(req: Request) {
    try {
        const { startDate, endDate } = Object.fromEntries(
            new URL(req.url).searchParams
        );

        // Validación de fechas
        if (!startDate || !endDate || isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
            return NextResponse.json(
                { error: "Parámetros de fecha inválidos" },
                { status: 400 }
            );
        }

        const query = `
            SELECT 
                'Ventas' AS tipo,
                v.fechaventa AS fecha,
                SUM(v.total) AS monto
            FROM 
                ventas v
            WHERE 
                v.fechaventa BETWEEN $1 AND $2
            GROUP BY 
                v.fechaventa
            UNION ALL
            SELECT 
                'Compras' AS tipo,
                c.fechacompra AS fecha,
                SUM(c.total) AS monto
            FROM 
                compras c
            WHERE 
                c.fechacompra BETWEEN $1 AND $2
            GROUP BY 
                c.fechacompra
            ORDER BY 
                fecha;
        `;

        const data = await getConnection().query(query, [startDate, endDate]);

        const formattedData: Transaction[] = data.rows.map((row: RawTransaction) => ({
            tipo: row.tipo,
            fecha: row.fecha,
            monto: parseFloat(row.monto),
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error("Error fetching transactions", error);
        return NextResponse.json(
            { error: "Error fetching transactions" },
            { status: 500 }
        );
    }
}
