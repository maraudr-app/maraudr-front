import { StockItem } from '../../types/stock/StockItem';

interface RecentStockHistoryProps {
    items: StockItem[];
}

export const RecentStockHistory = ({ items }: RecentStockHistoryProps) => {
    // Trier les items par date d'entrée (les plus récents d'abord)
    const sortedItems = [...items].sort((a, b) => 
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    ).slice(0, 5); // Prendre les 5 plus récents

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Historique récent
            </h3>
            <div className="space-y-3">
                {sortedItems.map((item) => (
                    <div 
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                        <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {item.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {item.category}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {item.quantity} unités
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