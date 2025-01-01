import { NextRequest, NextResponse } from "next/server";
import { getConnection } from '@/utils/database';

// Define interfaces for the database row and return types
interface DatabaseRow {
    idcompra: number;
    fechacompra: Date;
    total: string | number;
    idproveedor: number;
    proveedor: string | null;
    idproducto: number;
    producto: string | null;
    cantidad: number;
    precio_unitario: string | number;
}

interface PurchaseProduct {
    idproducto: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

interface Provider {
    idproveedor: number;
    nombre: string;
}

interface Purchase {
    idcompra: number;
    fechacompra: Date;
    total: number;
    proveedor: Provider;
    productos: PurchaseProduct[];
}

function purchaseDetails(rows: DatabaseRow[]): Purchase[] {
    const purchasesMap = new Map<number, Purchase>();
    
    rows.forEach(row => {
        if(!purchasesMap.has(row.idcompra)){
            purchasesMap.set(row.idcompra, {
                idcompra: row.idcompra,
                fechacompra: row.fechacompra,
                total: parseFloat(row.total.toString()) || 0,
                proveedor: {
                    idproveedor: row.idproveedor,
                    nombre: row.proveedor || 'Sin Proveedor'
                },
                productos: []
            });
        }

        purchasesMap.get(row.idcompra)?.productos.push({
            idproducto: row.idproducto,
            nombre: row.producto || 'Sin Producto',
            cantidad: row.cantidad || 0,
            precio_unitario: parseFloat(row.precio_unitario.toString()) || 0,
            subtotal: (row.cantidad || 0) * (parseFloat(row.precio_unitario.toString()) || 0)
        });
    });
    return Array.from(purchasesMap.values());
}

export async function GET() {
    try {
        const connection = await getConnection();
        const result = await connection.query(`
            SELECT 
                c.idcompra,
                c.fechacompra,
                c.total,
                p.idproveedor,
                p.nombre AS proveedor,
                cp.idproducto,
                prod.nombre AS producto,
                cp.cantidad,
                cp.precio_unitario
            FROM 
                compras c
            JOIN 
                proveedores p ON c.idproveedor = p.idproveedor
            JOIN 
                compras_productos cp ON c.idcompra = cp.idcompra
            JOIN 
                productos prod ON cp.idproducto = prod.idproducto
            WHERE
                c.habilitado = TRUE
            ORDER BY 
                c.fechacompra DESC, c.idcompra;
        `);

       const groupedPurchases = purchaseDetails(result.rows);
        return NextResponse.json(groupedPurchases, { status: 200 });
    } catch (error) {
        console.error("Error fetching purchases: ", error);
        return NextResponse.json(
            { message: "Error fetching purchases" },
            { status: 500 }
        );
    }
}

// Interface for POST request body
interface PurchaseInput {
    idproveedor: number;
    productos: {
        idproducto: number;
        cantidad: number;
        precio_unitario: number;
    }[];
    fechacompra?: Date;
}

export async function POST(req: NextRequest) {
    const connection = await getConnection();
    await connection.query('BEGIN');    
    try {
        const body = await req.json() as PurchaseInput;
        const {idproveedor, productos, fechacompra = new Date()} = body;
        
        if (!idproveedor || !productos || !Array.isArray(productos) || productos.length === 0) {
            return NextResponse.json(
                { message: "Datos de compra inválidos" },
                { status: 400 }
            );
        }

        const providerExists = await connection.query(
            'SELECT idproveedor FROM proveedores WHERE idproveedor = $1 AND habilitado = TRUE',
            [idproveedor]
        );

        if(providerExists.rows.length === 0){
            return NextResponse.json(
                { message: "Proveedor no encontrado" },
                { status: 404 }
            );
        }

        let total = 0;
        for(const product of productos){
            total += (product.cantidad * product.precio_unitario);
        }

        const purchaseResult = await connection.query(          
            `INSERT INTO compras (idproveedor, fechacompra, total) VALUES ($1, $2, $3) RETURNING idcompra`,
            [idproveedor, fechacompra, total]
        );
        const idcompra = purchaseResult.rows[0].idcompra;

        for (const product of productos) {
            const productExists = await connection.query(
                'SELECT idproducto FROM productos WHERE idproducto = $1 AND habilitado = TRUE',
                [product.idproducto]
            );

            if (productExists.rows.length === 0) {
                throw new Error(`Producto con ID ${product.idproducto} no encontrado`);
            }

            await connection.query(
                'INSERT INTO compras_productos (idcompra, idproducto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [idcompra, product.idproducto, product.cantidad, product.precio_unitario]
            );

            await connection.query(
                'UPDATE productos SET stock = stock + $1 WHERE idproducto = $2',
                [product.cantidad, product.idproducto]
            );
        }

        await connection.query('COMMIT');

        const result = await connection.query(`
            SELECT 
                c.idcompra,
                c.fechacompra,
                c.total,
                p.idproveedor,
                p.nombre AS proveedor,
                cp.idproducto,
                prod.nombre AS producto,
                cp.cantidad,
                cp.precio_unitario
            FROM 
                compras c
            JOIN 
                proveedores p ON c.idproveedor = p.idproveedor
            JOIN 
                compras_productos cp ON c.idcompra = cp.idcompra
            JOIN 
                productos prod ON cp.idproducto = prod.idproducto
            WHERE 
                c.idcompra = $1
        `, [idcompra]);
        
        const groupedPurchases = purchaseDetails(result.rows)[0];
        return NextResponse.json(groupedPurchases, { status: 201 });
    } catch (error) {
        await connection.query('ROLLBACK');
        console.error("Error creating purchase:", error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Error al crear la compra" },
            { status: 500 }
        );
    }
}