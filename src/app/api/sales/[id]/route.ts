import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/utils/database';

interface DatabaseRow {
    idventa: number;
    fechaventa: Date;
    total: string | number;
    idproducto: number;
    producto: string | null;
    cantidad: number;
    precio_unitario: string | number;
    habilitado: boolean;
    stock: number;
}

interface SaleProduct {
    idproducto: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

interface Sale {
    idventa: number;
    fechaventa: Date;
    total: number;
    habilitado: boolean;
    productos: SaleProduct[];
}

interface SaleUpdateInput {
    productos: {
        idproducto: number;
        cantidad: number;
        precio_unitario: number;
    }[];
    fechaventa?: Date;
}

function salesDetails(rows: DatabaseRow[]): Sale[] {
    const salesMap = new Map<number, Sale>();

    rows.forEach(row => {
        if (!salesMap.has(row.idventa)) {
            salesMap.set(row.idventa, {
                idventa: row.idventa,
                fechaventa: row.fechaventa,
                total: Number(row.total) || 0,
                habilitado: row.habilitado, 
                productos: []
            });
        }

        const sale = salesMap.get(row.idventa);
        if (sale) {
            sale.productos.push({
                idproducto: row.idproducto,
                nombre: row.producto || 'Sin nombre',
                cantidad: row.cantidad,
                precio_unitario: Number(row.precio_unitario) || 0,
                subtotal: row.cantidad * (Number(row.precio_unitario) || 0)
            });
        }
    });

    return Array.from(salesMap.values());
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    const {id} = await params;
    const saleId = parseInt(id);
    if (isNaN(saleId)) {
        return NextResponse.json(
            { error: 'ID de venta inválido' },
            { status: 400 }
        );
    }

    const pool = await getConnection();
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                v.idventa,
                v.fechaventa,
                v.total,
                v.habilitado,
                vp.idproducto,
                p.nombre as producto,
                vp.cantidad,
                vp.precio_unitario,
                p.stock
            FROM ventas v
            JOIN ventas_productos vp ON v.idventa = vp.idventa
            JOIN productos p ON vp.idproducto = p.idproducto
            WHERE v.idventa = $1
        `, [saleId]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Venta no encontrada' },
                { status: 404 }
            );
        }

        const sale = salesDetails(result.rows)[0];
        return NextResponse.json(sale);

    } catch (error) {
        console.error('Error fetching sale:', error);
        return NextResponse.json(
            { error: 'Error al obtener la venta' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    const { id } = await params;
    const saleId = parseInt(id);
    if (isNaN(saleId)) {
        return NextResponse.json(
            { error: 'ID de venta inválido' },
            { status: 400 }
        );
    }

    const pool = await getConnection();
    const client = await pool.connect();

    try {
        const data: SaleUpdateInput = await request.json();
        
        if (!Array.isArray(data.productos) || data.productos.length === 0) {
            return NextResponse.json(
                { error: 'La venta debe contener al menos un producto' },
                { status: 400 }
            );
        }

        await client.query('BEGIN');

        const ventaExists = await client.query(
            'SELECT idventa, habilitado FROM ventas WHERE idventa = $1',
            [saleId]
        );

        if (ventaExists.rows.length === 0) {
            return NextResponse.json(
                { error: 'Venta no encontrada' },
                { status: 404 }
            );
        }

        if (!ventaExists.rows[0].habilitado) {
            return NextResponse.json(
                { error: 'No se puede modificar una venta que ya ha sido pagada' },
                { status: 400 }
            );
        }

        const currentProducts = await client.query(
            'SELECT idproducto, cantidad FROM ventas_productos WHERE idventa = $1',
            [saleId]
        );

        for (const producto of currentProducts.rows) {
            await client.query(
                'UPDATE productos SET stock = stock + $1 WHERE idproducto = $2 AND habilitado = TRUE',
                [producto.cantidad, producto.idproducto]
            );
        }

        for (const producto of data.productos) {
            if (producto.cantidad <= 0) {
                throw new Error(`La cantidad debe ser mayor a 0 para el producto ${producto.idproducto}`);
            }

            if (producto.precio_unitario <= 0) {
                throw new Error(`El precio unitario debe ser mayor a 0 para el producto ${producto.idproducto}`);
            }

            const stockResult = await client.query(
                'SELECT stock FROM productos WHERE idproducto = $1 AND habilitado = TRUE',
                [producto.idproducto]
            );

            if (stockResult.rows.length === 0) {
                throw new Error(`Producto ${producto.idproducto} no encontrado o deshabilitado`);
            }

            if (stockResult.rows[0].stock < producto.cantidad) {
                throw new Error(`Stock insuficiente para el producto ${producto.idproducto}`);
            }
        }

        //----- Calcular el nuevo total]------
        const total = data.productos.reduce((sum, item) => 
            sum + (item.cantidad * item.precio_unitario), 0
        );

        //------- actualizar venta-----
        await client.query(
            'UPDATE ventas SET fechaventa = $1, total = $2 WHERE idventa = $3',
            [data.fechaventa || new Date(), total, saleId]
        );

        //-----eliminar productos previos de venta productos----------
        await client.query(
            'DELETE FROM ventas_productos WHERE idventa = $1',
            [saleId]
        );

        //===== insertar nuevo producto y actualizar stock ------
        for (const producto of data.productos) {
            await client.query(
                'INSERT INTO ventas_productos (idventa, idproducto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [saleId, producto.idproducto, producto.cantidad, producto.precio_unitario]
            );

            await client.query(
                'UPDATE productos SET stock = stock - $1 WHERE idproducto = $2',
                [producto.cantidad, producto.idproducto]
            );
        }

        await client.query('COMMIT');

        // Get obtener ventas actualizadas
        const updatedSale = await client.query(`
            SELECT 
                v.idventa,
                v.fechaventa,
                v.total,
                v.habilitado,
                vp.idproducto,
                p.nombre as producto,
                vp.cantidad,
                vp.precio_unitario
            FROM ventas v
            JOIN ventas_productos vp ON v.idventa = vp.idventa
            JOIN productos p ON vp.idproducto = p.idproducto
            WHERE v.idventa = $1
        `, [saleId]);

        return NextResponse.json(
            salesDetails(updatedSale.rows)[0],
            { status: 200 }
        );

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating sale:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error al actualizar la venta' },
            { status: 400 }
        );
    } finally {
        client.release();
    }
}

//----- Metodo delete --------------
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    const { id } = await params;
    const saleId = parseInt(id);
    if (isNaN(saleId)) {
        return NextResponse.json(
            { error: 'ID de venta inválido' },
            { status: 400 }
        );
    }

    const pool = await getConnection();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        //verificar si esta pagado o no
        const ventaExists = await client.query(
            'SELECT habilitado FROM ventas WHERE idventa = $1',
            [saleId]
        );

        if (ventaExists.rows.length === 0) {
            return NextResponse.json(
                { error: 'Venta no encontrada' },
                { status: 404 }
            );
        }

        if (!ventaExists.rows[0].habilitado) {
            return NextResponse.json(
                { error: 'No se puede eliminar una venta que ya ha sido pagada' },
                { status: 400 }
            );
        }

        // Get porductos ventas para restaurar el stock
        const productos = await client.query(
            'SELECT idproducto, cantidad FROM ventas_productos WHERE idventa = $1',
            [saleId]
        );

        // restaurar el stock
        for (const producto of productos.rows) {
            await client.query(
                'UPDATE productos SET stock = stock + $1 WHERE idproducto = $2 AND habilitado = TRUE',
                [producto.cantidad, producto.idproducto]
            );
        }

        //eliminar una venta de venta_productos
        await client.query(
            'DELETE FROM ventas_productos WHERE idventa = $1',
            [saleId]
        );

        //eliminar para ventas
        await client.query(
            'DELETE FROM ventas WHERE idventa = $1',
            [saleId]
        );

        await client.query('COMMIT');

        return NextResponse.json(
            { message: 'Venta eliminada correctamente' },
            { status: 200 }
        );

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting sale:', error);
        return NextResponse.json(
            { error: 'Error al eliminar la venta' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}

//------------PATCH - Actualizar el estado de pago de una venta-------------
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    const { id } = await params;
    const saleId = parseInt(id);
    if (isNaN(saleId)) {
        return NextResponse.json(
            { error: 'ID de venta inválido' },
            { status: 400 }
        );
    }

    const pool = await getConnection();
    const client = await pool.connect();

    try {
        const { habilitado } = await request.json(); 

        // Verificar si la venta existe
        const ventaExists = await client.query(
            'SELECT habilitado FROM ventas WHERE idventa = $1',
            [saleId]
        );

        if (ventaExists.rows.length === 0) {
            return NextResponse.json(
                { error: 'Venta no encontrada' },
                { status: 404 }
            );
        }

        // Actualizar al nuevo estado
        await client.query(
            'UPDATE ventas SET habilitado = $1 WHERE idventa = $2',
            [habilitado, saleId]
        );

        return NextResponse.json({ 
            success: true,
            message: `Venta marcada como ${habilitado ? 'no pagada' : 'pagada'}`
        });
        
    } catch (error) {
        console.error('Error updating sale payment status:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el estado de pago' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
