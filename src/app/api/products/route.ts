import { NextRequest, NextResponse } from "next/server";
import {getConnection} from '@/utils/database';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get("q") || "";

        const connection = await getConnection();
        const result = await connection.query(
            `
            SELECT 
                p.idproducto,
                p.nombre,
                p.descripcion,
                p.preciocompra,
                p.precioventa,
                p.stock,
                p.fechaingreso,
                c.nombre AS categoria,
                pr.nombre AS proveedor
            FROM productos p
            LEFT JOIN categorias c ON p.idcategoria = c.idcategoria
            LEFT JOIN proveedores pr ON p.idproveedor = pr.idproveedor
            WHERE p.habilitado = TRUE
            AND (
                p.nombre ILIKE $1 OR
                p.descripcion ILIKE $1 OR
                c.nombre ILIKE $1 OR
                pr.nombre ILIKE $1
            )
            ORDER BY p.nombre ASC
            `,
            [`%${query}%`] 
        );

        const products = result.rows.map(row => ({
            idproducto: row.idproducto || null,
            nombre: row.nombre || 'Sin Nombre',
            descripcion: row.descripcion || 'Sin Descripción',
            preciocompra: parseFloat(row.preciocompra) || 0, 
            precioventa: parseFloat(row.precioventa) || 0,   
            stock: row.stock || 0,
            fechaingreso: row.fechaingreso || null,
            categoria: row.categoria || 'Sin Categoría',
            proveedor: row.proveedor || 'Sin Proveedor',
        }));
        
        

        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error("Error fetching products: ", error);
        return NextResponse.json(
            { message: "Error fetching products" },
            { status: 500 }
        );
    }
}

export async function POST(req:NextRequest) {
    try{
        const body = await req.json();
        const connection = await getConnection();
        const {nombre, descripcion, preciocompra, precioventa, stock, fechaingreso,idcategoria,idproveedor,} = body;

        const categoryQuery = "SELECT * FROM categorias WHERE idcategoria = $1";
        const categoryResult = await connection.query(categoryQuery, [idcategoria]);
        if (categoryResult.rows.length === 0) {
        return NextResponse.json(
            { message: "Category not found" },
            { status: 400 }
        );
        }


        if(!nombre|| !preciocompra || !precioventa){
            return NextResponse.json(
                { message: "El nombre, precio compra y precio vento son requeridos"},
                { status: 400}
            );
        }

        const query = `
            INSERT INTO productos 
            (nombre, descripcion, preciocompra, precioventa, stock, fechaingreso, idcategoria, idproveedor) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

        const values = [
            nombre,
            descripcion || null, 
            preciocompra,
            precioventa,
            stock|| 0, 
            fechaingreso || new Date().toISOString().split("T")[0],
            idcategoria,
            idproveedor,
        ];

        const result = await connection.query(query,values);

        return NextResponse.json(result.rows[0], {status: 200});
    }catch(error){
        console.error("Error creating products", error);
        return NextResponse.json(
            {message: "Error creating products"},
            {status: 500}
        );
    }
}
