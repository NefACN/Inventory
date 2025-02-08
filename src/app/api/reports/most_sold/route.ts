import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

interface Product {
    idproducto: number;
    producto: string;
    cantidad_vendida: number;
    precio_promedio: string;
    ingresos_generados: string;
}

export async function GET(req: Request) {
    try {
        const {startDate, endDate} = Object.fromEntries(new URL(req.url).searchParams);

        if(!startDate || !endDate || isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
            return NextResponse.json(
                { error: "Invalid date parameters. Ensure startDate and endDate are valid ISO date strings." },
                { status: 400 }
            );
        }

        const query = `
            SELECT
                p.nombre AS producto,
                SUM(vp.cantidad) AS cantidad_vendida,
                AVG(vp.precio_unitario) AS precio_promedio,
                SUM(vp.cantidad * vp.precio_unitario) AS ingresos_generados
            FROM
                ventas v
            JOIN
                ventas_productos vp ON v.idventa = vp.idventa
            JOIN
                productos p ON vp.idproducto = p.idproducto
            WHERE
                v.fechaventa BETWEEN $1 AND $2
                AND v.habilitado = FALSE
            GROUP BY
                p.nombre
            ORDER BY
                cantidad_vendida DESC;
        `;
        const data = await getConnection().query<Product>(query, [startDate, endDate]);

        const formattedData: Product[] = data.rows.map((row) => ({
            idproducto: row.idproducto,
            producto: row.producto,
            cantidad_vendida: row.cantidad_vendida,
            precio_promedio: parseFloat(row.precio_promedio as unknown as string).toFixed(2),
            ingresos_generados: parseFloat(row.ingresos_generados as unknown as string).toFixed(2), 
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error("Error fetching most sold products data", error);
        return NextResponse.json({ error: "Error fetching most sold products data" }, { status: 500 });
    }
}