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

function salesDetails(rows: DatabaseRow[]): Sale[] {
    const salesMap = new Map<number, Sale>();

    rows.forEach(row => {
        if (!salesMap.has(row.idventa)) {
            salesMap.set(row.idventa, {
                idventa: row.idventa,
                fechaventa: row.fechaventa,
                total: parseFloat(row.total.toString()) || 0,
                habilitado: row.habilitado,
                productos: []
            });
        }

        salesMap.get(row.idventa)?.productos.push({
            idproducto: row.idproducto,
            nombre: row.producto || 'Sin Producto',
            cantidad: row.cantidad || 0,
            precio_unitario: parseFloat(row.precio_unitario.toString()) || 0,
            subtotal: (row.cantidad || 0) * (parseFloat(row.precio_unitario.toString()) || 0)
        });
    });

    return Array.from(salesMap.values());
}

// GET handler to fetch all sales
export async function GET() {
    const connection = await getConnection();
    try {
        const result = await connection.query(`
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
            LEFT JOIN ventas_productos vp ON v.idventa = vp.idventa
            LEFT JOIN productos p ON vp.idproducto = p.idproducto
            ORDER BY v.fechaventa DESC, v.idventa;
        `);

        const salesMap = new Map();
        
        result.rows.forEach(row => {
            if (!salesMap.has(row.idventa)) {
                salesMap.set(row.idventa, {
                    idventa: row.idventa,
                    fechaventa: row.fechaventa,
                    total: parseFloat(row.total),
                    habilitado: row.habilitado,
                    productos: []
                });
            }

            if (row.idproducto) {
                const sale = salesMap.get(row.idventa);
                sale.productos.push({
                    idproducto: row.idproducto,
                    nombre: row.producto,
                    cantidad: row.cantidad,
                    precio_unitario: parseFloat(row.precio_unitario),
                    subtotal: row.cantidad * parseFloat(row.precio_unitario)
                });
            }
        });

        return NextResponse.json(Array.from(salesMap.values()));
    } catch (error) {
        console.error('Error fetching sales:', error);
        return NextResponse.json({ error: 'Error al obtener las ventas' }, { status: 500 });
    } 
}

interface SaleInput {
    productos: {
      idproducto: number;
      cantidad: number;
      precio_unitario: number;
    }[];
    fechaventa?: Date;
    habilitado?: boolean; 
}

export async function POST(req: NextRequest) {
    const connection = await getConnection();
    await connection.query('BEGIN');

    try {
        const data: SaleInput = await req.json();

        if (!data.productos || data.productos.length === 0) {
            throw new Error('La venta debe contener al menos un producto');
        }

        // Verificar stock disponible
        for (const producto of data.productos) {
            const stockResult = await connection.query(
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

        const total = data.productos.reduce((sum, item) =>
            sum + (item.cantidad * item.precio_unitario), 0
        );

        // Insertar venta con estado_pago inicial en false
        // Insertar venta con habilitado inicial en true (no pagado)
            const ventaResult = await connection.query(
                'INSERT INTO ventas (fechaventa, total, habilitado) VALUES ($1, $2, $3) RETURNING idventa',
                [data.fechaventa || new Date(), total, true] // true significa no pagado
            );
        const idventa = ventaResult.rows[0].idventa;

        for (const producto of data.productos) {
            await connection.query(
                'INSERT INTO ventas_productos (idventa, idproducto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [idventa, producto.idproducto, producto.cantidad, producto.precio_unitario]
            );

            await connection.query(
                'UPDATE productos SET stock = stock - $1 WHERE idproducto = $2',
                [producto.cantidad, producto.idproducto]
            );
        }

        await connection.query('COMMIT');

        const ventaDetalle = await connection.query(`
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
        `, [idventa]);

        return NextResponse.json(
            salesDetails(ventaDetalle.rows)[0],
            { status: 201 }
        );

    } catch (error) {
        await connection.query('ROLLBACK');
        console.error('Error creating sale:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error al crear la venta' },
            { status: 400 }
        );
    }
}

