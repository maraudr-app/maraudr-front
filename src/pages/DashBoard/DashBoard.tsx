import { useTranslation } from 'react-i18next';
import { 
  ChartBarIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

const DashBoard = () => {
  const { t } = useTranslation();
  
  // Données statiques pour le demo
  const statsCards = [
    {
      title: t('dashboard.customers', 'Customers'),
      value: '1.456',
      change: '+6,5%',
      isPositive: true,
      icon: <UsersIcon className="w-6 h-6 text-indigo-500" />,
      iconBg: 'bg-indigo-100',
    },
    {
      title: t('dashboard.revenue', 'Revenue'),
      value: '$3.345',
      change: '-0,10%',
      isPositive: false,
      icon: <CurrencyDollarIcon className="w-6 h-6 text-emerald-500" />,
      iconBg: 'bg-emerald-100',
    },
    {
      title: t('dashboard.profit', 'Profit'),
      value: '60%',
      change: '-0,2%',
      isPositive: false,
      icon: <ChartBarIcon className="w-6 h-6 text-indigo-500" />,
      iconBg: 'bg-indigo-100',
    },
    {
      title: t('dashboard.invoices', 'Invoices'),
      value: '1.135',
      change: '+11,5%',
      isPositive: true,
      icon: <DocumentTextIcon className="w-6 h-6 text-indigo-500" />,
      iconBg: 'bg-indigo-100',
    },
  ];

  // Données pour le tableau des factures récentes
  const recentInvoices = [
    {
      id: 1,
      customerId: '#065499',
      customerName: 'Eren Yaeger',
      itemName: '1 x Black Backpack',
      orderDate: '21/07/2022 08:21',
      status: 'Paid',
      price: '$101',
    },
    {
      id: 2,
      customerId: '#065499',
      customerName: 'Levi Ackerman',
      itemName: '1 x Distro Backpack',
      orderDate: '21/07/2022 08:21',
      status: 'Pending',
      price: '$144',
    },
    {
      id: 3,
      customerId: '#065499',
      customerName: 'Rainer Brown',
      itemName: '1 x New Backpack',
      orderDate: '21/07/2022 08:21',
      status: 'Paid',
      price: '$121',
    },
    {
      id: 4,
      customerId: '#065499',
      customerName: 'Historia Reiss',
      itemName: '2 x Black Backpack',
      orderDate: '21/07/2022 08:21',
      status: 'Overdue',
      price: '$300',
    },
  ];

  // Fonction pour déterminer la couleur de statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="w-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{card.title}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</h3>
              <div className="flex items-center">
                <span className={`flex items-center text-sm ${card.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {card.isPositive ? 
                    <ArrowUpIcon className="w-3 h-3 mr-1" /> : 
                    <ArrowDownIcon className="w-3 h-3 mr-1" />
                  }
                  {card.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{t('dashboard.sinceLast', 'Since last week')}</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${card.iconBg} dark:bg-opacity-20`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Invoice Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('dashboard.invoiceStats', 'Invoice Statistics')}</h3>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <EllipsisHorizontalIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            {/* Donut chart visual representation */}
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800 dark:text-white">1.135</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.invoices', 'Invoices')}</div>
                </div>
              </div>
              {/* SVG representation of the donut chart */}
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3"
                  className="dark:stroke-gray-700"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="3"
                  strokeDasharray="40, 100"
                  className="dark:stroke-indigo-400"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth="3"
                  strokeDasharray="27, 100"
                  strokeDashoffset="-40"
                  className="dark:stroke-gray-800"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3"
                  strokeDasharray="33, 100"
                  strokeDashoffset="-67"
                  className="dark:stroke-gray-600"
                />
              </svg>
            </div>
            
            {/* Stats */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-black dark:bg-gray-300 mr-2"></span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('dashboard.totalPaid', 'Total Paid')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white ml-5">234</p>
              </div>
              <div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('dashboard.totalOverdue', 'Total Overdue')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white ml-5">514</p>
              </div>
              <div>
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('dashboard.totalUnpaid', 'Total Unpaid')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white ml-5">345</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('dashboard.salesAnalytics', 'Sales Analytics')}</h3>
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <EllipsisHorizontalIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="h-64 w-full">
            {/* Placeholder for a line chart - in a real app we'd use a chart library */}
            <div className="relative h-full w-full">
              <div className="absolute top-14 left-24 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded">
                $1,134
              </div>
              <div className="h-full w-full flex items-end justify-between">
                {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Des'].map((month, index) => {
                  // Arbitrary heights to simulate a line chart
                  const heights = [40, 60, 45, 55, 70, 60, 75, 55, 65, 60, 60, 40];
                  return (
                    <div key={month} className="flex flex-col items-center mb-2 w-full">
                      <div 
                        className={`w-full bg-indigo-100 dark:bg-indigo-900 ${index === 4 ? 'bg-indigo-500 dark:bg-indigo-500' : ''}`} 
                        style={{height: `${heights[index]}%`}}>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('dashboard.recentInvoices', 'Recent Invoices')}</h3>
          <button className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm">
            <FunnelIcon className="w-4 h-4 mr-1" />
            {t('dashboard.filter', 'Filter')}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3">{t('dashboard.no', 'No')}</th>
                <th className="px-6 py-3">{t('dashboard.idCustomers', 'Id Customers')}</th>
                <th className="px-6 py-3">{t('dashboard.customersName', 'Customers name')}</th>
                <th className="px-6 py-3">{t('dashboard.itemsName', 'Items Name')}</th>
                <th className="px-6 py-3">{t('dashboard.orderDate', 'Order Date')}</th>
                <th className="px-6 py-3">{t('dashboard.status', 'Status')}</th>
                <th className="px-6 py-3">{t('dashboard.price', 'Price')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentInvoices.map((invoice) => (
                <tr key={invoice.id} className="bg-white dark:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {invoice.customerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.customerName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.itemName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {invoice.orderDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                      {t(`dashboard.status${invoice.status}`, invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {invoice.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;