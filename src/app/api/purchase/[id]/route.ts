import { NextRequest, NextResponse } from "next/server";
import { getConnection } from '@/utils/database';

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

interface DatabaseRow {
    idcompra: number;
    fechacompra: Date;
    total: number;
    idproveedor: number;
    proveedor: string;
    idproducto: number;
    producto: string;
    cantidad: number;
    precio_unitario: number;
}

function purchaseDetails(rows: DatabaseRow[]): Purchase {
    if (rows.length === 0) {
        throw new Error("Purchase not found");
    }

    const purchase: Purchase = {
        idcompra: rows[0].idcompra,
        fechacompra: rows[0].fechacompra,
        total: parseFloat(rows[0].total.toString()),
        proveedor: {
            idproveedor: rows[0].idproveedor,
            nombre: rows[0].proveedor || 'Sin Proveedor'
        },
        productos: []
    };

    rows.forEach(row => {
        purchase.productos.push({
            idproducto: row.idproducto,
            nombre: row.producto || 'Sin Producto',
            cantidad: row.cantidad || 0,
            precio_unitario: parseFloat(row.precio_unitario.toString()) || 0,
            subtotal: (row.cantidad || 0) * (parseFloat(row.precio_unitario.toString()) || 0)
        });
    });

    return purchase;
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
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
                c.idcompra = $1 AND c.habilitado = TRUE
        `, [params.id]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: "Compra no encontrada" },
                { status: 404 }
            );
        }

        const purchase = purchaseDetails(result.rows);
        return NextResponse.json(purchase, { status: 200 });
    } catch (error) {
        console.error("Error fetching purchase:", error);
        return NextResponse.json(
            { message: "Error al obtener la compra" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const connection = await getConnection();
    await connection.query('BEGIN');
    
    try {
        const body = await req.json();
        const { idproveedor, productos, fechacompra } = body;

        if (!idproveedor || !productos || !Array.isArray(productos) || productos.length === 0) {
            return NextResponse.json(
                { message: "Datos de compra inválidos" },
                { status: 400 }
            );
        }

        const purchaseExists = await connection.query(
            'SELECT idcompra FROM compras WHERE idcompra = $1 AND habilitado = TRUE',
            [params.id]
        );

        if (purchaseExists.rows.length === 0) {
            return NextResponse.json(
                { message: "Compra no encontrada" },
                { status: 404 }
            );
        }

        const providerExists = await connection.query(
            'SELECT idproveedor FROM proveedores WHERE idproveedor = $1 AND habilitado = TRUE',
            [idproveedor]
        );

        if (providerExists.rows.length === 0) {
            return NextResponse.json(
                { message: "Proveedor no encontrado" },
                { status: 404 }
            );
        }

        const previousProducts = await connection.query(
            'SELECT idproducto, cantidad FROM compras_productos WHERE idcompra = $1',
            [params.id]
        );

        for (const product of previousProducts.rows) {
            await connection.query(
                'UPDATE productos SET stock = stock - $1 WHERE idproducto = $2',
                [product.cantidad, product.idproducto]
            );
        }

        await connection.query(
            'DELETE FROM compras_productos WHERE idcompra = $1',
            [params.id]
        );

        let total = 0;
        for (const product of productos) {
            total += (product.cantidad * product.precio_unitario);
        }

        await connection.query(
            `UPDATE compras 
             SET idproveedor = $1, fechacompra = $2, total = $3
             WHERE idcompra = $4`,
            [idproveedor, fechacompra, total, params.id]
        );

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
                [params.id, product.idproducto, product.cantidad, product.precio_unitario]
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
        `, [params.id]);

        const updatedPurchase = purchaseDetails(result.rows);
        return NextResponse.json(updatedPurchase, { status: 200 });
    } catch (error) {
        await connection.query('ROLLBACK');
        console.error("Error updating purchase:", error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Error al actualizar la compra" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const connection = await getConnection();
    await connection.query('BEGIN');

    try {
        const purchaseExists = await connection.query(
            'SELECT idcompra FROM compras WHERE idcompra = $1 AND habilitado = TRUE',
            [params.id]
        );

        if (purchaseExists.rows.length === 0) {
            return NextResponse.json(
                { message: "Compra no encontrada" },
                { status: 404 }
            );
        }

        const products = await connection.query(
            'SELECT idproducto, cantidad FROM compras_productos WHERE idcompra = $1',
            [params.id]
        );

        for (const product of products.rows) {
            await connection.query(
                'UPDATE productos SET stock = stock - $1 WHERE idproducto = $2',
                [product.cantidad, product.idproducto]
            );
        }

        await connection.query(
            'UPDATE compras SET habilitado = FALSE WHERE idcompra = $1',
            [params.id]
        );

        await connection.query('COMMIT');
        return NextResponse.json(
            { message: "Compra eliminada correctamente" },
            { status: 200 }
        );
    } catch (error) {
        await connection.query('ROLLBACK');
        console.error("Error deleting purchase:", error);
        return NextResponse.json(
            { message: "Error al eliminar la compra" },
            { status: 500 }
        );
    }
}