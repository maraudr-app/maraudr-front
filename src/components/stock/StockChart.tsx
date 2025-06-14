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
import { useState, useEffect, useMemo } from 'react';
import { Select } from '../common/select/select';
import { RecentStockHistory } from './RecentStockHistory';
// Import du Button plus nécessaire si on le supprime entièrement
// import { Button } from '../common/button/button';
import { MultiSelectDropdown } from '../common/multiSelectDropdown/multiSelectDropdown';

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

// Couleurs Maraudr
const maraudrColors = {
    blue: 'rgb(59, 130, 246)', // maraudr-blue
    blueTransparent: 'rgba(59, 130, 246, 0.5)',
    orange: 'rgb(249, 115, 22)', // maraudr-orange
    orangeTransparent: 'rgba(249, 115, 22, 0.5)',
};

export const StockChart = ({ items }: StockChartProps) => {
    const [chartType, setChartType] = useState<ChartType>('line');
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

    // Initialiser et mettre à jour les items sélectionnés (tous par défaut)
    useEffect(() => {
        if (items.length > 0) {
            setSelectedItemIds(items.map(item => item.id));
        }
    }, [items]);

    // Filtrer les items basés sur la sélection de l'utilisateur
    const filteredItems = useMemo(() => {
        if (selectedItemIds.length === 0) {
            return []; // Ne rien afficher si aucun item n'est sélectionné
        }
        return items.filter(item => selectedItemIds.includes(item.id));
    }, [items, selectedItemIds]);

    // Préparer les données pour le graphique avec les items filtrés
    const chartData = {
        labels: filteredItems.map(item => item.name),
        datasets: [
            {
                label: 'Quantité en stock',
                data: filteredItems.map(item => item.quantity),
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
                labels: {
                    color: 'rgb(17, 24, 39)', // text-gray-900
                    font: {
                        size: 14,
                        weight: 500,
                    },
                },
            },
            title: {
                display: true,
                text: filteredItems.length > 0 ? `Quantité en stock (${filteredItems.map(item => item.name).join(', ')})` : 'Quantité des items en stock',
                color: 'rgb(17, 24, 39)', // text-gray-900
                font: {
                    size: 16,
                    weight: 600,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Quantité',
                    color: 'rgb(17, 24, 39)', // text-gray-900
                    font: {
                        size: 14,
                        weight: 500,
                    },
                },
                grid: {
                    color: 'rgba(156, 163, 175, 0.2)', // gray-400 with opacity
                },
                ticks: {
                    color: 'rgb(107, 114, 128)', // text-gray-500
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Items',
                    color: 'rgb(17, 24, 39)', // text-gray-900
                    font: {
                        size: 14,
                        weight: 500,
                    },
                },
                grid: {
                    color: 'rgba(156, 163, 175, 0.2)', // gray-400 with opacity
                },
                ticks: {
                    color: 'rgb(107, 114, 128)', // text-gray-500
                },
            },
        },
    };

    const handleItemSelectChange = (values: string[]) => {
        setSelectedItemIds(values);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graphique */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-center mb-4 space-x-4">
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
                    <div className="w-48">
                        <MultiSelectDropdown
                            options={items.map(item => ({ value: item.id, label: item.name }))}
                            selectedValues={selectedItemIds}
                            onChange={handleItemSelectChange}
                            placeholder="Sélectionner des items"
                        />
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