import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

export async function GET(req: NextRequest, {params}: {params: {id:string}}) {
    try{
        const connection = getConnection();
        const {id}= params;
        if (!id) {
            return NextResponse.json(
              { message: "ID is required." },
              { status: 400 }
            );
        }
        const query ="SELECT * FROM categorias WHERE idcategoria = $1";
        const value = [id];
        const result = await connection.query(query,value);

        if(result.rows.length === 0){
            return NextResponse.json(
                {message: "Categorie not found."},
                {status: 404}
            );
        }
        return NextResponse.json(result.rows[0]);
    }catch(error: unknown) {
        if(error instanceof Error) {
            console.error("Error fetching categories by ID: ", error.message);
            return NextResponse.json(
                {message: error.message},
                {status: 500}
            );
        }

        console.error("Unexpected error type: ", error);
        return NextResponse.json(
            {message: "An unknown error ocurred"},
            {status:500}
        );
    }   
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    try {
        const connection = await getConnection();
        const body = await req.json();
        const { id } = context.params;
        const { nombre, descripcion } = body;

        const query = `
            UPDATE categorias SET
                nombre = $1,
                descripcion = $2
            WHERE idcategoria = $3
        `;
        const values = [nombre, descripcion, id];

        await connection.query(query, values);

        return NextResponse.json({ message: "Categoría actualizada correctamente" }, { status: 200 });
    } catch (error) {
        console.error("Error al actualizar la categoría: ", error);
        return NextResponse.json({ message: "Error al actualizar la categoría" }, { status: 500 });
    }
}