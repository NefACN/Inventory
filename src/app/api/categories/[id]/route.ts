import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/utils/database";

export async function GET(req: NextRequest, {params}: {params: {id:string}}) {
    try{
        const connection = getConnection();
        const {id}= await params;
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

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    try {
        const connection = await getConnection();
        const { id } = await context.params;
        const url = new URL(req.url);
        const deleteType = url.searchParams.get('type') || 'logical';
        const body = await req.json().catch(() => ({}));

        if(body.type === 'restore'){
            const restoreQuery = "UPDATE categorias SET habilitado = TRUE WHERE idcategoria = $1 RETURNING *";
            const result = await connection.query(restoreQuery, [id]);

            if ( result.rowCount === 0) {
                return NextResponse.json({ message: "Categoría no encontrada" }, { status: 404 });
            }

            return NextResponse.json(result.rows[0]);
        }
        if ( deleteType === 'logical') {
            const query = "UPDATE categorias SET habilitado = FALSE WHERE idcategoria = $1 RETURNING *";
            const result = await connection.query(query, [id]);
            if (result.rowCount === 0) {
                return NextResponse.json({ message: "Categoría no encontrada" }, { status: 404 });
            }
            return NextResponse.json(result.rows[0]);
        } else if (deleteType === 'physical') {
            const query = "DELETE FROM categorias WHERE idcategoria = $1 RETURNING *";
            const result = await connection.query(query, [id]);

            if(result.rowCount === 0){
                return NextResponse.json({ message: "Categoría no encontrada" }, { status: 404 });
            }

            return NextResponse.json({ message: "Categoría eliminada permanentemente", data: result.rows[0] });
        } else {
            return NextResponse.json(
                { message: "Tipo de eliminación inválido. Use 'logical', 'physical', o 'restore'." },
                { status: 400 }
            );
        }
    } catch (error: unknown) {
        console.error("Error procesando la categoría: ", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    }
}