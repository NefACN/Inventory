'use client';
import React, { useEffect, useState } from "react";
import InventoryTable from "@/components/reports/inventory/InventoryTable";
import SummaryCard from "@/components/reports/inventory/SummaryCard";
import ClientLayout from "@/components/layouts/ClientLayout";

// Definimos la interfaz para los productos
interface Product {
    idproducto: number;
    producto: string;
    stock: number;
    preciocompra: number;
    precioventa: number;
    valor_total_compra: number;
    valor_total_venta: number;
    categoria: string | null;
    fechaingreso: string;
}

// Definimos la interfaz para el resumen
interface Summary {
    totalProducts: number;
    totalStock: number;
    totalValuePurchase: number;
    totalValueSale: number;
}

const InventoryPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [summary, setSummary] = useState<Summary>({
        totalProducts: 0,
        totalStock: 0,
        totalValuePurchase: 0,
        totalValueSale: 0,
    });

    useEffect(() => {
        const fetchInventory = async () => {
            const res = await fetch("/api/reports/inventory");
            const data: Product[] = await res.json();

            setProducts(data);

            // Calcular el resumen
            const totalProducts = data.length;
            const totalStock = data.reduce((acc: number, product) => acc + product.stock, 0);
            const totalValuePurchase = data.reduce((acc: number, product) => acc + product.valor_total_compra, 0);
            const totalValueSale = data.reduce((acc: number, product) => acc + product.valor_total_venta, 0);

            setSummary({
                totalProducts,
                totalStock,
                totalValuePurchase,
                totalValueSale,
            });
        };

        fetchInventory();
    }, []);

    return (
        <ClientLayout>
        <div>
            <SummaryCard {...summary} />
            <InventoryTable products={products} />
        </div>
        </ClientLayout>
    );
};

export default InventoryPage;
