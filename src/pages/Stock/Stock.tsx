import { useTranslation } from 'react-i18next';

const Stock = () => {
  const { t } = useTranslation();

  return (
    <div className="p-8 ml-16 mt-16">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {t('sidebar.stock', 'Stock Management')}
      </h1>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {t('stock.description', 'Manage your inventory and track your products in real-time.')}
        </p>
        
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            {t('stock.inventory', 'Current Inventory')}
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 text-center">
            {t('stock.empty', 'No items in stock. Add items to get started.')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stock; 