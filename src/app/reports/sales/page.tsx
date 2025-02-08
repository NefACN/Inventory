'use client';
import { useState, useEffect } from 'react';
import SalesTable from '@/components/reports/sales/SalesTable';
import DateFilter from '@/components/reports/sales/DateFilter';
import SummaryCard from '@/components/reports/sales/SummaryCard';
import ClientLayout from '@/components/layouts/ClientLayout';

interface Sale {
    idventa: number;
    fechaventa: string; 
    idproducto: number;
    producto: string;
    cantidad: number;
    precio_unitario: number; 
    total_producto: number;   
    total_venta: number;   
}

export default function SalesReportPage() {
    const today = new Date().toISOString().split('T')[0];
    const [data, setData] = useState<Sale[]>([]);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [summaryData, setSummaryData] = useState({
        totalSales: 0,
        totalProducts: 0,
        avgSalePerProduct: 0
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/reports/sales?startDate=${startDate}&endDate=${endDate}`);
                const json: Sale[] = await res.json();
                setData(json);

                const totalSales = json.reduce((sum, item) => sum + item.total_venta, 0);
                const totalProducts = json.reduce((sum, item) => sum + item.cantidad, 0);
                const avgSalePerProduct = totalSales / totalProducts || 0;

                setSummaryData({
                    totalSales,
                    totalProducts,
                    avgSalePerProduct
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
            <h1>Reporte de Ventas</h1>
            <DateFilter 
                startDate={startDate} 
                endDate={endDate} 
                onStartDateChange={setStartDate} 
                onEndDateChange={setEndDate} 
            />
            <SummaryCard
                totalSales={summaryData.totalSales}
                totalProducts={summaryData.totalProducts}
                avgSalePerProduct={summaryData.avgSalePerProduct}
            />
            <SalesTable data={data} />
        </div>
        </ClientLayout>
    );
}