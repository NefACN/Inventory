import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

// Handler para obtener un producto por ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const connection = await getConnection();
      const { id } = params;
  
      // Update the query to include JOIN with categories and providers
      const query = `
        SELECT 
          p.*,
          c.nombre AS categoria,
          pr.nombre AS proveedor
        FROM productos p
        LEFT JOIN categorias c ON p.idcategoria = c.idcategoria
        LEFT JOIN proveedores pr ON p.idproveedor = pr.idproveedor
        WHERE p.idproducto = $1 AND p.habilitado = TRUE
      `;
      
      const result = await connection.query(query, [id]);
  
      if (result.rows.length === 0) {
        return NextResponse.json(
          { message: "Product not found" }, 
          { status: 404 }
        );
      }
  
      // Format the response data
      const product = result.rows[0];
      return NextResponse.json({
        idproducto: product.idproducto,
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        preciocompra: parseFloat(product.preciocompra) || 0,
        precioventa: parseFloat(product.precioventa) || 0,
        stock: parseInt(product.stock) || 0,
        fechaingreso: product.fechaingreso,
        idcategoria: product.idcategoria,
        idproveedor: product.idproveedor,
        categoria: product.categoria,
        proveedor: product.proveedor
      });
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      return NextResponse.json(
        { message: "Internal server error" }, 
        { status: 500 }
      );
    }
  }

// Handler para actualizar un producto
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const connection = await getConnection(); // Add await here
      const body = await req.json();
  
      const {
        nombre,
        descripcion,
        preciocompra,
        precioventa,
        stock,
        fechaingreso,
        idcategoria,
        idproveedor,
      } = body;
  
      // Add validation for required fields
      if (!nombre || !preciocompra || !precioventa) {
        return NextResponse.json(
          { message: "Required fields are missing" },
          { status: 400 }
        );
      }
  
      // Validate that category and provider exist
      const categoryExists = await connection.query(
        "SELECT idcategoria FROM categorias WHERE idcategoria = $1",
        [idcategoria]
      );
      
      const providerExists = await connection.query(
        "SELECT idproveedor FROM proveedores WHERE idproveedor = $1",
        [idproveedor]
      );

      if (categoryExists.rows.length === 0 || providerExists.rows.length === 0) {
        return NextResponse.json(
          { message: "Invalid category or provider" },
          { status: 400 }
        );
      }

      // Update query
      const query = `
        UPDATE productos SET 
        nombre = $1, 
        descripcion = $2, 
        preciocompra = $3, 
        precioventa = $4, 
        stock = $5, 
        fechaingreso = $6, 
        idcategoria = $7, 
        idproveedor = $8
        WHERE idproducto = $9 AND habilitado = TRUE
        RETURNING *`;
        
      const values = [
        nombre,
        descripcion,
        preciocompra,
        precioventa,
        stock,
        fechaingreso || new Date().toISOString().split('T')[0],
        idcategoria,
        idproveedor,
        params.id // Use params.id directly
      ];
  
      const result = await connection.query(query, values);
  
      if (result.rows.length === 0) {
        return NextResponse.json(
          { message: "Product not found or already disabled" }, 
          { status: 404 }
        );
      }
  
      // Return updated product with category and provider names
      const updatedProduct = await connection.query(`
        SELECT 
          p.*,
          c.nombre AS categoria,
          pr.nombre AS proveedor
        FROM productos p
        LEFT JOIN categorias c ON p.idcategoria = c.idcategoria
        LEFT JOIN proveedores pr ON p.idproveedor = pr.idproveedor
        WHERE p.idproducto = $1
      `, [params.id]);

      return NextResponse.json(updatedProduct.rows[0]);
    } catch (error) {
      console.error("Error updating product:", error);
      return NextResponse.json(
        { message: "Internal server error" }, 
        { status: 500 }
      );
    }
}  

// Handler para eliminar (deshabilitar) un producto
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const connection = getConnection();
    const { id } = params;

    const query = "UPDATE productos SET habilitado = FALSE WHERE idproducto = $1 RETURNING *";
    const result = await connection.query(query, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
