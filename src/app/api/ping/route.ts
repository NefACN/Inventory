import {NextResponse } from "next/server";
import {getConnection} from '@/utils/database'

type Data = {
    message: string;
    time: string;
};

export async function GET() {

    const connection = await getConnection();
    const response = await connection.query("SELECT NOW()");

    return NextResponse.json<Data>({message:'pingo', time: response.rows[0].now});
}