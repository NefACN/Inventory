import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

interface PurchaseProduct {
    idcompra: number;
    fechacompra: string;
    total_compra: string;
    idproducto: number;
    producto: string;
    cantidad: number;
    precio_unitario: string;
    total_producto: string;
}

interface FormattedPurchaseProduct {
    idcompra: number;
    fechacompra: Date;
    total_compra: number;
    idproducto: number;
    producto: string;
    cantidad: number;
    precio_unitario: number;
    total_producto: number;
}

export async function GET(req: Request) {
    try{
        const { startDate, endDate } = Object.fromEntries( new URL(req.url).searchParams );
        //validado parametros de entrada
        if(!startDate || !endDate || isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))){
            return NextResponse.json(
                { error: 'Invalid date parameters. Ensure startDate and endDate are valid ISO date strings.' },
                { status: 400 }
            );
        }

        const query = `
            SELECT 
                c.idcompra,
                c.fechacompra,
                c.total AS total_compra,
                cp.idproducto,
                p.nombre AS producto,
                cp.cantidad,
                cp.precio_unitario,
                (cp.cantidad * cp.precio_unitario) AS total_producto
            FROM 
                compras c
            JOIN 
                compras_productos cp ON c.idcompra = cp.idcompra
            JOIN 
                productos p ON cp.idproducto = p.idproducto
            WHERE 
                c.fechacompra BETWEEN $1 AND $2
            ORDER BY 
                c.fechacompra;
        `;

        const data = await getConnection().query<PurchaseProduct>(query, [startDate, endDate]);

        const formattedData: FormattedPurchaseProduct[] = data.rows.map((row) => ({
            idcompra: row.idcompra,
            fechacompra: new Date(row.fechacompra),
            total_compra: parseFloat(row.total_compra),
            idproducto: row.idproducto,
            producto: row.producto,
            cantidad: row.cantidad,
            precio_unitario: parseFloat(row.precio_unitario),
            total_producto: parseFloat(row.total_producto)
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}