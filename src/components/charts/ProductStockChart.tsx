'use client';

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Registrar los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ProductStock {
    nombre: string;
    stock: number;
}

export default function ProductStockChart() {
    const [productData, setProductData] = useState<ProductStock[]>([]);

    useEffect(() => {
        async function fetchProductData() {
            try {
                const response = await fetch("/api/charts/stock_charts");
                if (!response.ok) throw new Error("Error fetching stock data");
                const data: ProductStock[] = await response.json();
                setProductData(data);
            } catch (error) {
                console.error("Error loading stock data:", error);
            }
        }
        fetchProductData();
    }, []);

    // Configuración del gráfico de barras
    const chartData = {
        labels: productData.map(p => p.nombre), // Nombres de productos en el eje X
        datasets: [
            {
                label: "Stock",
                data: productData.map(p => p.stock), // Valores de stock en el eje Y
                backgroundColor: productData.map(p => (p.stock > 10 ? "#2ecc71" : "#e74c3c")), // Colores dinámicos
                borderColor: "#333",
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false }, // Ocultar la leyenda
            title: { display: true, text: "Stock de Productos", font: { size: 18 } },
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
    };

    return <Bar data={chartData} options={chartOptions} />;
}
