import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

interface Product {
    idproducto: number;
    producto: string;
    stock: number;
    preciocompra: number;
    precioventa: number;
    valor_total_compra: number;
    valor_total_venta: number;
    categoria: string | null;
    fechaingreso: Date;
}

export async function GET() {
    try {
        const query = `
            SELECT 
                p.idproducto,
                p.nombre AS producto,
                p.stock,
                p.preciocompra,
                p.precioventa,
                (p.stock * p.preciocompra) AS valor_total_compra,
                (p.stock * p.precioventa) AS valor_total_venta,
                c.nombre AS categoria,
                p.fechaingreso
            FROM 
                productos p
            LEFT JOIN 
                categorias c ON p.idcategoria = c.idcategoria
            WHERE 
                p.habilitado = TRUE
            ORDER BY 
                p.stock DESC;
        `;

        const data = await getConnection().query(query);

        // Formateamos los datos con tipado
        const formattedData: Product[] = data.rows.map((row: Product) => ({
            ...row,
            preciocompra: parseFloat(row.preciocompra as unknown as string),
            precioventa: parseFloat(row.precioventa as unknown as string),
            valor_total_compra: parseFloat(row.valor_total_compra as unknown as string),
            valor_total_venta: parseFloat(row.valor_total_venta as unknown as string),
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error("Error fetching inventory data", error);
        return NextResponse.json({ error: "Error fetching inventory data" }, { status: 500 });
    }
}