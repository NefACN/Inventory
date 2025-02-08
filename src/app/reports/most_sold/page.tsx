'use client';
import React, { useEffect, useState } from "react";
import MostSoldTable from "@/components/reports/most_sold/MostSoldTable";
import DateFilter from "@/components/reports/most_sold/DateFilter";
import MostSoldSummary from "@/components/reports/most_sold/MostSoldSummary";
import ClientLayout from "@/components/layouts/ClientLayout";

interface Product {
    idproducto: number;
    producto: string;
    cantidad_vendida: number;
    precio_promedio: string;
    ingresos_generados: string;
}

export default function MostSoldPage() {
    const today = new Date().toISOString().split("T")[0];
    const [data, setData] = useState<Product[]>([]);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/reports/most_sold?startDate=${startDate}&endDate=${endDate}`);
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData();
    }, [startDate, endDate]);

    return (
        <ClientLayout>
        <div>
            <h1>Productos mas vendidos</h1>
            <DateFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
            />
            <MostSoldSummary products={data} />
            <MostSoldTable products={data} />
        </div>
        </ClientLayout>
    )
}