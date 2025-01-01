import { NextRequest, NextResponse } from "next/server";
import {getConnection} from '@/utils/database';

export async function GET() {
    try{
        const connection = await getConnection();
        const result = await connection.query("SELECT * FROM proveedores WHERE habilitado = TRUE");
        return NextResponse.json(result.rows, {status: 200});
    }catch(error){
        console.error("Error fetching suppliers: ",error);
        return NextResponse.json(
            {mesasge: "Error fetching suppliers"},
            {status: 500}
        );
    }
}

export async function POST(req:NextRequest) {
    try{
        const body = await req.json();
        const {nombre, contacto, telefono, direccion,} = body;

        if(!nombre){
            return NextResponse.json(
                { message: "El nombre es requerido"},
                { status: 400}
            );
        }

        const query = `
            INSERT INTO proveedores 
            (nombre, contacto, telefono, direccion) 
            VALUES ($1, $2, $3, $4) RETURNING *`;

        const values = [
            nombre,
            contacto || null,
            telefono || null,
            direccion || null
        ];

        const connection = await getConnection();
        const result = await connection.query(query,values);

        return NextResponse.json(result.rows[0], {status: 200});
    }catch(error){
        console.error("Error creating suppliers", error);
        return NextResponse.json(
            {message: "Error creating suppliers"},
            {status: 500}
        );
    }
}
