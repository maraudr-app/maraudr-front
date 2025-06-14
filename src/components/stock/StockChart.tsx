import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { StockItem } from '../../types/stock/StockItem';
import { useState } from 'react';
import { Select } from '../common/select/select';
import { RecentStockHistory } from './RecentStockHistory';

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

interface StockChartProps {
    items: StockItem[];
}

type ChartType = 'bar' | 'line';

const chartTypes = [
    { value: 'line', label: 'Courbe' },
    { value: 'bar', label: 'Barres' }
] as const;

export const StockChart = ({ items }: StockChartProps) => {
    const [chartType, setChartType] = useState<ChartType>('line');

    // Préparer les données pour le graphique
    const chartData = {
        labels: items.map(item => item.name),
        datasets: [
            {
                label: 'Quantité en stock',
                data: items.map(item => item.quantity),
                backgroundColor: 'rgba(249, 115, 22, 0.5)', // maraudr-orange avec transparence
                borderColor: 'rgb(249, 115, 22)', // maraudr-orange
                borderWidth: 2,
                tension: 0.4, // Pour la courbe
                fill: false, // Pour la courbe
                pointBackgroundColor: 'rgb(59, 130, 246)', // maraudr-blue
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Quantité des items en stock',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Quantité'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Items'
                }
            }
        },
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graphique */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-center mb-4">
                    <div className="w-48">
                        <Select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value as ChartType)}
                            placeholder="Type de graphique"
                        >
                            {chartTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className="h-[400px]">
                    {chartType === 'bar' ? (
                        <Bar data={chartData} options={options} />
                    ) : (
                        <Line data={chartData} options={options} />
                    )}
                </div>
            </div>

            {/* Historique récent */}
            <div className="lg:col-span-1">
                <RecentStockHistory items={items} />
            </div>
        </div>
    );
}; 