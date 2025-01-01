import { NextRequest, NextResponse } from "next/server";
import {getConnection} from '@/utils/database'

export async function GET(req: NextRequest, {params}:{params: {id:string}}){
    try{
        const connection = getConnection();
        const {id} = params;

        const query = "SELECT * FROM proveedores WHERE idproveedor = $1";
        const values = [id];
        const result = await connection.query(query,values);
        
        if(result.rows.length === 0){
            return NextResponse.json(
                {mesasge: "Supplier not found"},
                {status: 404}
            );
        }
        return NextResponse.json(result.rows[0]);

    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching suppliers by ID:", error.message);
            return NextResponse.json(
            { message: error.message }, 
            { status: 500 }
            );
        }
    
        console.error("Unexpected error type:", error);
        return NextResponse.json(   
            { message: "An unknown error occurred" }, 
            { status: 500 }
        );
    }
}


export async function PUT(req: NextRequest, {params}: {params: {id: string}}) {
    try{
        const connection = getConnection();
        const body = await req.json();
        const {id} = params;

        const {
            nombre,
            contacto,
            telefono,
            direccion
          } = body;

        const query = `
            UPDATE proveedores SET 
            nombre = $1, 
            contacto = $2,
            telefono = $3,
            direccion = $4
            WHERE idproveedor = $5 RETURNING *`;
        const values = [ 
            nombre,
            contacto,
            telefono,
            direccion,
            id,];
        const result = await connection.query(query,values);
        
        if(result.rows.length === 0){
            return NextResponse.json(
                {message: "Supplier not found"},
                {status: 404}
            );
        }
        return NextResponse.json(result.rows[0]);

    }catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching supplier by ID:", error.message);
            return NextResponse.json(
            { message: error.message }, 
            { status: 500 }
            );
        }
    
        console.error("Unexpected error type:", error);
        return NextResponse.json(   
            { message: "An unknown error occurred" }, 
            { status: 500 }
        );
    }
    
}


export async function DELETE(req: NextRequest,{params}: {params:{id:string}}) {
    try{
        const connection = getConnection();
        const {id}= params;

        const query = "UPDATE proveedores SET habilitado = FALSE WHERE idproveedor = $1 RETURNING *";
        const values = [id];
        const result = await connection.query(query,values);

        console.log(result);
        if(result.rowCount === 0){
            return NextResponse.json(
                {message: "Supplier not found"},
                {status: 404}
            );
        }

        return NextResponse.json(result.rows[0]);
    } catch (error: unknown){
        if (error instanceof Error) {
            console.error("Error deleting supplier: ", error.message);
            return NextResponse.json(
                { message: error.message }, 
                { status: 500 }
            );
        }
        console.error("Unexpected error type:", error);
        return NextResponse.json(   
            { message: "An unknown error occurred" }, 
            { status: 500 }
        );
    }
}