"use client";

import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";

interface SaleChart {
  fechaventa: string;
  total_ventas: number;
}

export default function SalesChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [salesData, setSalesData] = useState<SaleChart[]>([]);

  useEffect(() => {
    async function fetchSalesData() {
      try {
        const response = await fetch("/api/charts/sales_charts");
        if (!response.ok) throw new Error("Error fetching sales data");
        const data: SaleChart[] = await response.json();
        setSalesData(data);
      } catch (error) {
        console.error("Error loading sales data:", error);
      }
    }
    fetchSalesData();
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || salesData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000",
      },
      grid: {
        vertLines: { color: "#e1ecf2" },
        horzLines: { color: "#e1ecf2" },
      },
    });

    const lineSeries = chart.addLineSeries({
      color: "#2196f3",
      lineWidth: 2,
    });

    const formattedData = salesData.map(({ fechaventa, total_ventas }) => ({
      time: new Date(fechaventa).toISOString().split("T")[0], // Convierte a "YYYY-MM-DD"
      value: Number(total_ventas), // Aquí se corrige el acceso a `total_ventas`
    }));

    lineSeries.setData(formattedData);
    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [salesData]);

  return <div ref={chartContainerRef} className="w-full h-[300px]" />;
}
