import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

export async function GET(req: NextRequest) {
    try{
        const searchParams = req.nextUrl.searchParams;
        const query = searchParams.get("q") || "";
        const connection = await getConnection();
        let result;
        if(query.length>0){
            result = await connection.query(
                "SELECT * FROM categorias WHERE habilitado = TRUE AND nombre ILIKE $1 LIMIT 10",
                [`%${query}%`]
            );
        } else {
            result = await connection.query("SELECT * FROM categorias WHERE habilitado = TRUE");
        }
        return NextResponse.json(result.rows, {status: 200});
    }catch(error){
        console.error("Error fetching categories: ", error);
        return NextResponse.json(
            {message: "Error fetching categories."},
            {status: 500}
        );
    }
}

export async function POST(req: NextRequest) {
    try{
        const body = await req.json();
        const {nombre,descripcion,}= body;

        if(!nombre){
            return NextResponse.json(
                {message: "El nombre de la categoria es requerido."},
                {status: 400}
            );
        }

        const query = `INSERT INTO categorias (nombre,descripcion) VALUES ($1,$2) RETURNING *`;

        const values = [
            nombre,
            descripcion || null,
        ];

        const connection = await getConnection();
        const result = await connection.query(query,values);

        return NextResponse.json(result.rows[0], {status: 200});
    }catch(error){
        console.error("Error creating categories ", error);
        return NextResponse.json(
            {message: 'Error creating categories.'},
            {status:500}
        );
    }
    
}