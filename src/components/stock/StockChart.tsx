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
import { StockItem, Category, getAllCategories, getCategoryName, getTranslatedCategories } from '../../types/stock/StockItem';
import { useState, useEffect, useMemo } from 'react';
import { Select } from '../common/select/select';
import { RecentStockHistory } from './RecentStockHistory';
import { MultiSelectDropdown } from '../common/multiSelectDropdown/multiSelectDropdown';
import { useTranslation } from 'react-i18next';

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
type ViewMode = 'byCategory' | 'byItem';

// Couleurs Maraudr
const maraudrColors = {
    blue: 'rgb(59, 130, 246)', // maraudr-blue
    blueTransparent: 'rgba(59, 130, 246, 0.5)',
    orange: 'rgb(249, 115, 22)', // maraudr-orange
    orangeTransparent: 'rgba(249, 115, 22, 0.5)',
};

export const StockChart = ({ items }: StockChartProps) => {
    const { t } = useTranslation();
    const [chartType, setChartType] = useState<ChartType>('line');
    const [viewMode, setViewMode] = useState<ViewMode>('byCategory');
    const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

    // Fonction pour les traductions du stock
    const t_stock = (key: string): string => {
        return t(`stock.${key}` as any);
    };

    // Types de graphiques traduits
    const chartTypesTranslated = useMemo(() => [
        { value: 'line', label: t_stock('line') },
        { value: 'bar', label: t_stock('bar') }
    ], [t_stock]);

    const categories = useMemo(() => [
        { value: 'all', label: t_stock('allCategories') },
        ...getTranslatedCategories(t)
            .filter(cat => cat.value !== Category.Unknown)
            .map(cat => ({ value: cat.value.toString(), label: cat.label }))
    ], [t_stock, t]);

    // Initialiser les items sélectionnés en fonction du mode de vue et de la catégorie
    useEffect(() => {
        if (viewMode === 'byItem' && selectedCategory !== 'all' && items.length > 0) {
            const itemsInSelectedCategory = items.filter(item => item.category === selectedCategory);
            setSelectedItemIds(itemsInSelectedCategory.map(item => item.id));
        } else if (viewMode === 'byCategory') {
            setSelectedItemIds([]); // Pas de sélection d'item individuelle en mode catégorie
        }
    }, [items, viewMode, selectedCategory]);

    const dataForChart = useMemo(() => {
        if (viewMode === 'byCategory') {
            // Filtrer les items par catégorie si une catégorie spécifique est sélectionnée
            const filteredItems = selectedCategory === 'all' 
                ? items 
                : items.filter(item => item.category === selectedCategory);
            
            const categoryQuantities = filteredItems.reduce((acc, item) => {
                // Exclure les items avec la catégorie Unknown
                if (item.category === Category.Unknown) {
                    return acc;
                }
                const categoryName = Object.keys(Category)[Object.values(Category).indexOf(item.category)];
                acc[categoryName] = (acc[categoryName] || 0) + item.quantity;
                return acc;
            }, {} as Record<string, number>);

            const labels = Object.keys(categoryQuantities);
            const data = Object.values(categoryQuantities);

            return {
                labels,
                datasets: [
                    {
                        label: t_stock('totalQuantityByCategory'),
                        data,
                        backgroundColor: maraudrColors.orangeTransparent,
                        borderColor: maraudrColors.orange,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointBackgroundColor: maraudrColors.blue,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            };
        } else { // byItem mode
            const filteredItems = items.filter(item => 
                (selectedCategory === 'all' || item.category === selectedCategory) && 
                selectedItemIds.includes(item.id) &&
                item.category !== Category.Unknown
            );

            return {
                labels: filteredItems.map(item => item.name),
                datasets: [
                    {
                        label: t_stock('stockQuantity'),
                        data: filteredItems.map(item => item.quantity),
                        backgroundColor: maraudrColors.orangeTransparent,
                        borderColor: maraudrColors.orange,
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointBackgroundColor: maraudrColors.blue,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            };
        }
    }, [items, viewMode, selectedCategory, selectedItemIds, t_stock]);

    const options = useMemo(() => ({
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
                text: viewMode === 'byCategory' 
                    ? t_stock('quantityByCategory') 
                    : `${t_stock('stockQuantity')} (${dataForChart.labels.join(', ')})`,
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
                    text: t_stock('quantity'),
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
                    text: viewMode === 'byCategory' ? t_stock('categories') : t_stock('items'),
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
    }), [viewMode, dataForChart.labels]);

    const handleItemSelectChange = (values: string[]) => {
        setSelectedItemIds(values);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'all') {
            setSelectedCategory('all');
        } else {
            const categoryValue = parseInt(value) as Category;
            setSelectedCategory(categoryValue);
        }
    };

    const handleViewModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mode = e.target.value as ViewMode;
        setViewMode(mode);
        
        // Si on passe en mode byItem et qu'aucune catégorie n'est sélectionnée, sélectionner la première
        if (mode === 'byItem' && selectedCategory === 'all' && items.length > 0) {
            const firstCategory = items[0].category;
            setSelectedCategory(firstCategory);
        }
    };

    const itemsForMultiSelect = useMemo(() => {
        if (selectedCategory === 'all') {
            return [];
        }
        return items
            .filter(item => item.category === selectedCategory && item.category !== Category.Unknown)
            .map(item => ({ value: item.id, label: item.name }));
    }, [items, selectedCategory]);

    // Modes de vue traduits
    const viewModesTranslated = useMemo(() => [
        { value: 'byCategory', label: t_stock('quantityByCategory') },
        { value: 'byItem', label: t_stock('stockQuantity') }
    ], [t_stock]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Graphique */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-center mb-4 space-x-4 flex-wrap">
                    <div className="w-48">
                        <Select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value as ChartType)}
                            placeholder={t_stock('chartType')}
                        >
                            {chartTypesTranslated.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="w-48">
                        <Select
                            value={viewMode}
                            onChange={handleViewModeChange}
                            placeholder="Mode de vue"
                        >
                            {viewModesTranslated.map(mode => (
                                <option key={mode.value} value={mode.value}>
                                    {mode.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="w-48">
                        <Select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            placeholder={t_stock('allCategories')}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                    {viewMode === 'byItem' && (
                        <div className="w-48">
                            <MultiSelectDropdown
                                options={itemsForMultiSelect}
                                selectedValues={selectedItemIds}
                                onChange={handleItemSelectChange}
                                placeholder={t_stock('selectItems')}
                            />
                        </div>
                    )}
                </div>
                <div className="h-[400px] w-full">
                    {chartType === 'bar' ? (
                        <Bar data={dataForChart} options={options} />
                    ) : (
                        <Line data={dataForChart} options={options} />
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