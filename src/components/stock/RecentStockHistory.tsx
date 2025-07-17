import { StockItem, getCategoryName } from '../../types/stock/StockItem';
import { useTranslation } from 'react-i18next';

interface RecentStockHistoryProps {
    items: StockItem[];
}

export const RecentStockHistory = ({ items }: RecentStockHistoryProps) => {
    const { t } = useTranslation();

    // Fonction pour les traductions du stock
    const t_stock = (key: string): string => {
        return t(`stock.${key}` as any);
    };
    // Trier les items par date d'entrée (les plus récents d'abord)
    const sortedItems = [...items].sort((a, b) => 
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    ).slice(0, 5); // Prendre les 5 plus récents

    // Fonction pour obtenir une couleur d'arrière-plan basée sur l'index
    const getBackgroundColor = (index: number) => {
        const colors = [
            'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-l-4 border-orange-300',
            'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-l-4 border-blue-300',
            'bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 border-l-4 border-orange-300',
            'bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-900/20 dark:to-orange-900/20 border-l-4 border-blue-300',
            'bg-gradient-to-r from-orange-100 via-blue-50 to-orange-50 dark:from-orange-900/25 dark:via-blue-900/15 dark:to-orange-900/20 border-l-4 border-orange-200'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {t_stock('recentHistory')}
            </h3>
            <div className="space-y-3">
                {sortedItems.map((item, index) => (
                    <div 
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 hover:shadow-md ${getBackgroundColor(index)}`}
                    >
                        <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {item.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {getCategoryName(item.category)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {item.quantity} {t_stock('units')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(item.entryDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 