import { NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

export async function GET() {
    try {
      const connection = await getConnection();
  
      const query = `
        SELECT 
          p.*,
          c.nombre AS categoria,
          pr.nombre AS proveedor
        FROM productos p
        LEFT JOIN categorias c ON p.idcategoria = c.idcategoria
        LEFT JOIN proveedores pr ON p.idproveedor = pr.idproveedor
        WHERE p.habilitado = FALSE
      `;
  
      const result = await connection.query(query);
  
      if (result.rows.length === 0) {
        return NextResponse.json({ message: "No disabled products found" }, { status: 404 });
      }
  
      return NextResponse.json(result.rows);
    } catch (error) {
      console.error("Error fetching disabled products:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  }
  