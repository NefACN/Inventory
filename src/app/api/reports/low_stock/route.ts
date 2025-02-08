import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

interface Product {
    idproducto: number;
    producto: string;
    stock: number;
    preciocompra: number;
    precioventa: number;
    categoria: string | null;
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
                c.nombre AS categoria
            FROM 
                productos p
            LEFT JOIN 
                categorias c ON p.idcategoria = c.idcategoria
            WHERE 
                p.stock < 10
                AND p.habilitado = TRUE
            ORDER BY 
                p.stock ASC;
        `;
        const data = await getConnection().query(query);

        // Formateamos los datos con tipado
        const formattedData: Product[] = data.rows.map((row: Product) => ({
            ...row,
            preciocompra: parseFloat(row.preciocompra as unknown as string),
            precioventa: parseFloat(row.precioventa as unknown as string),
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error("Error fetching low stock products data", error);
        return NextResponse.json({ error: "Error fetching low stock products data" }, { status: 500 });
    }
}