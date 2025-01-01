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
    estado_pago: boolean;
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
    estado_pago: boolean;
    productos: SaleProduct[];
}

interface SaleUpdateInput {
    productos: {
        idproducto: number;
        cantidad: number;
        precio_unitario: number;
    }[];
    fechaventa?: Date;
    estado_pago?: boolean;
}

// Función auxiliar para procesar los resultados de la base de datos
function salesDetails(rows: DatabaseRow[]): Sale[] {
    const salesMap = new Map<number, Sale>();

    rows.forEach(row => {
        if (!salesMap.has(row.idventa)) {
            salesMap.set(row.idventa, {
                idventa: row.idventa,
                fechaventa: row.fechaventa,
                total: parseFloat(row.total.toString()) || 0,
                estado_pago: row.estado_pago,
                productos: []
            });
        }

        const sale = salesMap.get(row.idventa);
        if (sale) {
            sale.productos.push({
                idproducto: row.idproducto,
                nombre: row.producto || 'Sin nombre',
                cantidad: row.cantidad,
                precio_unitario: parseFloat(row.precio_unitario.toString()) || 0,
                subtotal: row.cantidad * (parseFloat(row.precio_unitario.toString()) || 0)
            });
        }
    });

    return Array.from(salesMap.values());
}

// GET - Obtener una venta específica
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const pool = await getConnection();
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                v.idventa,
                v.fechaventa,
                v.total,
                v.estado_pago,
                vp.idproducto,
                p.nombre as producto,
                vp.cantidad,
                vp.precio_unitario
            FROM ventas v
            JOIN ventas_productos vp ON v.idventa = vp.idventa
            JOIN productos p ON vp.idproducto = p.idproducto
            WHERE v.idventa = $1 AND v.habilitado = TRUE
        `, [params.id]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Venta no encontrada' },
                { status: 404 }
            );
        }

        const sale = salesDetails(result.rows)[0];
        return NextResponse.json(sale, { status: 200 });

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

// PUT - Actualizar una venta existente
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const pool = await getConnection();
    const client = await pool.connect();

    try {
        const data: SaleUpdateInput = await request.json();
        await client.query('BEGIN');

        // Verificar si la venta existe y obtener su estado actual
        const ventaExists = await client.query(
            'SELECT idventa, estado_pago FROM ventas WHERE idventa = $1 AND habilitado = TRUE',
            [params.id]
        );

        if (ventaExists.rows.length === 0) {
            return NextResponse.json(
                { error: 'Venta no encontrada' },
                { status: 404 }
            );
        }

        // Mantener el estado de pago actual si no se proporciona uno nuevo
        const estado_pago = data.estado_pago !== undefined ? data.estado_pago : ventaExists.rows[0].estado_pago;

        // 1. Restaurar el stock original
        const currentProducts = await client.query(
            'SELECT idproducto, cantidad FROM ventas_productos WHERE idventa = $1',
            [params.id]
        );

        for (const producto of currentProducts.rows) {
            await client.query(
                'UPDATE productos SET stock = stock + $1 WHERE idproducto = $2',
                [producto.cantidad, producto.idproducto]
            );
        }

        // 2. Verificar stock disponible para los nuevos productos
        for (const producto of data.productos) {
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

        // 3. Calcular el nuevo total
        const total = data.productos.reduce((sum, item) => 
            sum + (item.cantidad * item.precio_unitario), 0
        );

        // 4. Actualizar la venta
        await client.query(
            'UPDATE ventas SET fechaventa = $1, total = $2, estado_pago = $3 WHERE idventa = $4',
            [data.fechaventa || new Date(), total, estado_pago, params.id]
        );

        // 5. Eliminar productos anteriores
        await client.query(
            'DELETE FROM ventas_productos WHERE idventa = $1',
            [params.id]
        );

        // 6. Insertar nuevos productos y actualizar stock
        for (const producto of data.productos) {
            await client.query(
                'INSERT INTO ventas_productos (idventa, idproducto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [params.id, producto.idproducto, producto.cantidad, producto.precio_unitario]
            );

            await client.query(
                'UPDATE productos SET stock = stock - $1 WHERE idproducto = $2',
                [producto.cantidad, producto.idproducto]
            );
        }

        await client.query('COMMIT');

        // Obtener la venta actualizada
        const updatedSale = await client.query(`
            SELECT 
                v.idventa,
                v.fechaventa,
                v.total,
                v.estado_pago,
                vp.idproducto,
                p.nombre as producto,
                vp.cantidad,
                vp.precio_unitario
            FROM ventas v
            JOIN ventas_productos vp ON v.idventa = vp.idventa
            JOIN productos p ON vp.idproducto = p.idproducto
            WHERE v.idventa = $1
        `, [params.id]);

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

// DELETE - Deshabilitar una venta (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const pool = await getConnection();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verificar si la venta existe
        const ventaExists = await client.query(
            'SELECT idventa FROM ventas WHERE idventa = $1 AND habilitado = TRUE',
            [params.id]
        );

        if (ventaExists.rows.length === 0) {
            return NextResponse.json(
                { error: 'Venta no encontrada' },
                { status: 404 }
            );
        }

        // Obtener productos de la venta para restaurar stock
        const productos = await client.query(
            'SELECT idproducto, cantidad FROM ventas_productos WHERE idventa = $1',
            [params.id]
        );

        // Restaurar stock
        for (const producto of productos.rows) {
            await client.query(
                'UPDATE productos SET stock = stock + $1 WHERE idproducto = $2',
                [producto.cantidad, producto.idproducto]
            );
        }

        // Deshabilitar la venta
        await client.query(
            'UPDATE ventas SET habilitado = FALSE WHERE idventa = $1',
            [params.id]
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

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Validar y convertir el ID
    const saleId = parseInt(params.id);
    if (isNaN(saleId)) {
        return NextResponse.json({ error: 'ID de venta inválido' }, { status: 400 });
    }

    const pool = await getConnection();
    
    try {
        const { estado_pago } = await request.json();
        
        const result = await pool.query(
            'UPDATE ventas SET habilitado = $1 WHERE idventa = $2 RETURNING *',
            [estado_pago, saleId] // Usamos saleId en lugar de params.id
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true,
            message: `Venta marcada como ${estado_pago ? 'no pagada' : 'pagada'}`
        });
    } catch (error) {
        console.error('Error updating sale status:', error);
        return NextResponse.json({ error: 'Error al actualizar el estado' }, { status: 500 });
    }
}