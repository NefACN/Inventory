import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

interface SaleProduct {
    idventa: number;
    fechaventa: string; 
    idproducto: number;
    producto: string;
    cantidad: number;
    precio_unitario: string; 
    total_producto: string;
    total_venta: string;
}

interface FormattedSaleProduct {
    idventa: number;
    fechaventa: Date;
    idproducto: number;
    producto: string;
    cantidad: number;
    precio_unitario: number;
    total_producto: number;
    total_venta: number;
}

export async function GET(req: Request) {
    try {
        const { startDate, endDate } = Object.fromEntries(
            new URL(req.url).searchParams
        );

        // validar parametros de fecha
        if (!startDate || !endDate || isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
            return NextResponse.json(
                { error: 'Invalid date parameters. Ensure startDate and endDate are valid ISO date strings.' }, 
                { status: 400 }
            );
        }

        const query = `
            SELECT
                v.idventa,
                v.fechaventa,
                vp.idproducto,
                p.nombre AS producto,
                vp.cantidad,
                vp.precio_unitario,
                (vp.cantidad * vp.precio_unitario) AS total_producto,
                v.total AS total_venta
            FROM 
                ventas v
            JOIN
                ventas_productos vp ON v.idventa = vp.idventa
            JOIN 
                productos p ON vp.idproducto = p.idproducto
            WHERE 
                v.fechaventa BETWEEN $1 AND $2
                AND v.habilitado = FALSE
            ORDER BY
                v.fechaventa;
        `;

        const data = await getConnection().query<SaleProduct>(query, [startDate, endDate]);

        const formattedData: FormattedSaleProduct[] = data.rows.map((row) => ({
            idventa: row.idventa,
            fechaventa: new Date(row.fechaventa),
            idproducto: row.idproducto,
            producto: row.producto,
            cantidad: row.cantidad,
            precio_unitario: parseFloat(row.precio_unitario),
            total_producto: parseFloat(row.total_producto),
            total_venta: parseFloat(row.total_venta),
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error("Error fetching sales data", error);
        return NextResponse.json(
            { error: "Error fetching sales data. Please try again later." },
            { status: 500 }
        );
    }
}
