import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

export async function GET() {
    try {
        const connection = await getConnection();
        const query = `
            SELECT
                c.idcategoria,
                c.nombre,
                c.descripcion
            FROM
                categorias c
            WHERE 
                habilitado = FALSE;
        `;
        const result = await connection.query(query);
        if (result.rows.length === 0) {
            return NextResponse.json({ message: "No disabled categories found" }, { status: 404 });
        }
        return NextResponse.json(result.rows);
    } catch(error) {
        console.error("Error fetching disabled categories:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}