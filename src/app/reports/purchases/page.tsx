'use client';
import { useState, useEffect } from 'react';
import PurchasesTable from '@/components/reports/purchases/PurchasesTable';
import DateFilter from '@/components/reports/purchases/DateFilter';
import SummaryCard from '@/components/reports/purchases/SummaryCard';
import ClientLayout from '@/components/layouts/ClientLayout';

interface Purchase {
    idcompra: number;
    fechacompra: string;
    total_compra: number;
    idproducto: number;
    producto: string;
    cantidad: number;
    precio_unitario: number;
    total_producto: number;
}

export default function PurchasesReportPage() {
    const today = new Date().toISOString().split('T')[0];
    const [data, setData] = useState<Purchase[]>([]);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [summaryData, setSummaryData] = useState({
        totalPurchases: 0,
        totalProducts: 0,
        avgPurchasePerProduct: 0
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/reports/purchases?startDate=${startDate}&endDate=${endDate}`);
                const json: Purchase[] = await res.json();
                setData(json);

                const totalPurchases = json.reduce((sum, item) => sum + item.total_compra, 0);
                const totalProducts = json.reduce((sum, item) => sum + item.cantidad, 0);
                const avgPurchasePerProduct = totalPurchases / totalProducts || 0;

                setSummaryData({
                    totalPurchases,
                    totalProducts,
                    avgPurchasePerProduct
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, [startDate, endDate]);

    return (
        <ClientLayout>
        <div>
            <h1>Reporte de Compras</h1>
            <DateFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
            />
            <SummaryCard 
                totalPurchases={summaryData.totalPurchases}
                totalProducts={summaryData.totalProducts}
                avgPurchasePerProduct={summaryData.avgPurchasePerProduct}
            />
            <PurchasesTable data={data} />
        </div>
        </ClientLayout>
    );
}