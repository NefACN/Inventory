import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

export async function GET() {
    try {
        const connection = await getConnection();
        const query = `
            SELECT
                p.idproveedor,
                p.nombre,
                p.contacto,
                p.telefono,
                p.direccion
            FROM
                proveedores p
            WHERE 
                habilitado = FALSE;
        `;
        const result = await connection.query(query);
        if(result.rows.length === 0){
            return NextResponse.json({message: "No disabled suppliers found"}, {status: 404});
        }
        return NextResponse.json(result.rows);
    }catch(error){
        console.error("Error fetching disabled suppliers:", error);
        return NextResponse.json({message: "Internal server error"}, {status: 500});
    }
}