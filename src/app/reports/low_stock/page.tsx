'use client';
import React, { useEffect, useState } from "react";
import LowStockTable from "@/components/reports/low_stock/LowStockTable";
import ClientLayout from "@/components/layouts/ClientLayout";

interface Product {
    idproducto: number; 
    producto: string;
    stock: number;
    preciocompra: number;
    precioventa: number;
    categoria: string | null;   
}

const LowStockPage = () => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchLowStock = async () => {
            const res = await fetch("/api/reports/low_stock");
            const data: Product[] = await res.json();

            setProducts(data);
        };

        fetchLowStock();
    }, []);

    return (
        <ClientLayout>
        <LowStockTable products={products} />
        </ClientLayout>
    );
}

export default LowStockPage;