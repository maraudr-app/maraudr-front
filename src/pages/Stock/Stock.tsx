import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  ReceiptPercentIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const Stock = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedExpensePeriod, setSelectedExpensePeriod] = useState('monthly');

  // Données fictives pour les statistiques
  const stats = [
    {
      title: t('stock.balance', 'Balance'),
      value: '$2190.19',
      icon: <CreditCardIcon className="h-6 w-6 text-white" />,
      bgColor: 'bg-indigo-600',
    },
    {
      title: t('stock.income', 'Income'),
      value: '$21.30',
      icon: <BanknotesIcon className="h-6 w-6 text-blue-600" />,
      bgColor: 'bg-gray-100',
    },
    {
      title: t('stock.savings', 'Savings'),
      value: '$1875.10',
      icon: <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />,
      bgColor: 'bg-gray-100',
    },
    {
      title: t('stock.expenses', 'Expenses'),
      value: '$19.112',
      icon: <ReceiptPercentIcon className="h-6 w-6 text-blue-600" />,
      bgColor: 'bg-gray-100',
    },
  ];

  // Données fictives pour le graphique
  const expenseCategories = [
    { name: t('stock.shopping', 'Shopping'), value: 35, color: 'bg-indigo-800 dark:bg-indigo-700' },
    { name: t('stock.workspace', 'Workspace'), value: 25, color: 'bg-indigo-600 dark:bg-indigo-500' },
    { name: t('stock.food', 'Food'), value: 20, color: 'bg-indigo-400 dark:bg-indigo-400' },
    { name: t('stock.entertainment', 'Entertainments'), value: 20, color: 'bg-indigo-200 dark:bg-indigo-300' },
  ];

  // Données fictives pour les transactions
  const transactions = [
    {
      id: 1,
      name: 'Cameron Williamson',
      category: 'Figma',
      date: '12/02/22',
      time: '10:37:19 AM',
      amount: '$17.12',
      status: 'Pending',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 2,
      name: 'Courtney Henry',
      category: 'Netflix',
      date: '11/02/22',
      time: '12:22:21 AM',
      amount: '$10.21',
      status: 'Completed',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      id: 3,
      name: 'Eleanor Pena',
      category: 'Spotify',
      date: '10/02/22',
      time: '10:11:39 AM',
      amount: '$12.18',
      status: 'Completed',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
    },
  ];

  // Données fictives pour la carte
  const cardInfo = {
    number: '0818 7183 0713 2514',
    expiryDate: '07/10',
    type: 'VISA',
    balance: '$2190.19',
    cardType: 'mandiri'
  };

  // Données fictives pour les contacts fréquents
  const contacts = [
    { id: 1, name: 'John', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
    { id: 2, name: 'Sarah', avatar: 'https://randomuser.me/api/portraits/women/5.jpg' },
    { id: 3, name: 'Michael', avatar: 'https://randomuser.me/api/portraits/men/6.jpg' },
    { id: 4, name: 'Emily', avatar: 'https://randomuser.me/api/portraits/women/7.jpg' },
    { id: 5, name: 'David', avatar: 'https://randomuser.me/api/portraits/men/8.jpg' },
    { id: 6, name: 'Jessica', avatar: 'https://randomuser.me/api/portraits/women/9.jpg' },
  ];

  // Fonction pour obtenir la classe de couleur basée sur le statut
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-500';
      case 'Pending':
        return 'text-amber-500';
      case 'Failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="w-full">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`rounded-xl shadow-sm overflow-hidden ${index === 0 ? 'bg-indigo-600' : 'bg-white dark:bg-gray-800'}`}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mb-2">
                <div className={`p-2 rounded-full ${stat.bgColor} ${index === 0 ? 'bg-opacity-20' : 'dark:bg-opacity-20'}`}>
                  {stat.icon}
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
              </div>
              <p className={`text-sm font-medium mb-1 ${index === 0 ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                {stat.title}
              </p>
              <p className={`text-3xl font-bold ${index === 0 ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques et carte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              {t('stock.finances', 'Finances')}
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center">
                <span className="h-2 w-2 bg-blue-500 rounded-full mr-1"></span>
                <span className="text-gray-600 dark:text-gray-300">{t('stock.income', 'Income')}</span>
              </div>
              <div className="flex items-center">
                <span className="h-2 w-2 bg-red-400 rounded-full mr-1"></span>
                <span className="text-gray-600 dark:text-gray-300">{t('stock.outcome', 'Outcome')}</span>
              </div>
              <div className="flex items-center ml-4 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                <span className="text-gray-700 dark:text-gray-300 mr-1">{t(`stock.${selectedPeriod}`, 'Monthly')}</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Graphique de ligne - simplifié avec des div */}
          <div className="relative h-64 w-full">
            <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
              <div>4k</div>
              <div>3k</div>
              <div>2k</div>
              <div>1k</div>
              <div>0</div>
            </div>
            <div className="absolute bottom-0 left-6 right-0 top-0 flex flex-col justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="border-b border-dashed border-gray-200 dark:border-gray-700 h-1/4"></div>
              <div className="border-b border-dashed border-gray-200 dark:border-gray-700 h-1/4"></div>
              <div className="border-b border-dashed border-gray-200 dark:border-gray-700 h-1/4"></div>
              <div className="border-b border-dashed border-gray-200 dark:border-gray-700 h-1/4"></div>
            </div>
            {/* Courbe rouge (dépenses) */}
            <div className="absolute bottom-0 left-6 right-0 h-full bg-red-50 dark:bg-red-900 dark:bg-opacity-10 rounded-lg overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <path 
                  d="M0,50 C20,30 40,70 60,50 C80,30 100,60 120,40 C140,20 160,60 180,40 C200,20 220,50 240,30 C260,20 280,40 300,20" 
                  fill="none" 
                  stroke="#FCA5A5" 
                  strokeWidth="2"
                  className="dark:stroke-red-400" 
                />
              </svg>
            </div>
            {/* Courbe bleue (revenus) */}
            <div className="absolute bottom-0 left-6 right-0 h-full">
              <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <path 
                  d="M0,90 C20,80 40,60 60,70 C80,80 100,60 120,50 C140,40 160,50 180,30 C200,20 220,40 240,20 C260,10 280,30 300,20" 
                  fill="none" 
                  stroke="#93C5FD" 
                  strokeWidth="2"
                  className="dark:stroke-blue-400" 
                />
              </svg>
            </div>
            {/* Légende axe X */}
            <div className="absolute bottom-[-20px] left-6 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <div>01</div>
              <div>05</div>
              <div>10</div>
              <div>15</div>
              <div>20</div>
              <div>25</div>
              <div>30</div>
            </div>
          </div>
        </div>

        <div className="grid grid-rows-2 gap-6">
          {/* Graphique des dépenses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                {t('stock.allExpenses', 'All Expenses')}
              </h3>
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-sm">
                <span className="text-gray-700 dark:text-gray-300 mr-1">{t(`stock.${selectedExpensePeriod}`, 'Monthly')}</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Graphique circulaire */}
              <div className="w-32 h-32 relative">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  {expenseCategories.map((category, index) => {
                    const offset = expenseCategories
                      .slice(0, index)
                      .reduce((acc, curr) => acc + curr.value, 0);
                    const percentage = category.value;
                    return (
                      <circle
                        key={index}
                        cx="18"
                        cy="18"
                        r="15.91549430918954"
                        fill="transparent"
                        stroke={`url(#gradient-${index})`}
                        strokeWidth="3"
                        strokeDasharray={`${percentage} ${100 - percentage}`}
                        strokeDashoffset={`${100 - offset + 25}`}
                        className={category.color}
                      />
                    );
                  })}
                  <circle cx="18" cy="18" r="12" fill="white" className="dark:fill-gray-800" />
                </svg>
              </div>

              {/* Légende */}
              <div className="flex flex-col space-y-2 flex-1">
                {expenseCategories.map((category, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`h-3 w-3 rounded-full ${category.color} mr-2`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Périodes */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">{t('stock.daily', 'Daily')}</p>
                <p className="font-semibold text-gray-800 dark:text-white">$573.12</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">{t('stock.weekly', 'Weekly')}</p>
                <p className="font-semibold text-gray-800 dark:text-white">$4,791</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400">{t('stock.monthly', 'Monthly')}</p>
                <p className="font-semibold text-gray-800 dark:text-white">$19,112</p>
              </div>
            </div>
          </div>

          {/* Carte bancaire */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                {t('stock.myCards', 'My Cards')}
              </h3>
              <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Carte */}
            <div className="bg-indigo-600 rounded-xl p-4 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-6 bg-yellow-300 rounded opacity-70"></div>
                <div className="text-right">
                  <p>{cardInfo.cardType}</p>
                </div>
              </div>
              <p className="font-mono text-lg mb-2">{cardInfo.number}</p>
              <div className="flex justify-between">
                <p className="text-xs">{cardInfo.expiryDate}</p>
                <p className="text-lg font-semibold">{cardInfo.type}</p>
              </div>
            </div>

            {/* Informations de balance */}
            <div className="mt-4">
              <div className="flex justify-between mb-2">
                <p className="text-gray-500 dark:text-gray-400">{t('stock.yourBalance', 'Your Balance')}</p>
                <div>
                  <span className="text-green-500 mr-2"><ArrowUpIcon className="inline-block h-3 w-3" /> 9.14%</span>
                  <span className="text-red-500"><ArrowDownIcon className="inline-block h-3 w-3" /> 8.39%</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{cardInfo.balance}</p>

              <div className="flex justify-between text-sm mb-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('stock.currency', 'Currency')}</p>
                  <p className="font-medium text-gray-800 dark:text-white">USD / US Dollar</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('stock.status', 'Status')}</p>
                  <p className="font-medium text-gray-800 dark:text-white">{t('stock.active', 'Active')}</p>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                {t('stock.addNewCard', 'Add New Card')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions & Transferts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              {t('stock.transactions', 'Transactions')}
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                <span className="text-gray-700 dark:text-gray-300 mr-1">{t('stock.recent', 'Recent')}</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {transactions.map(transaction => (
              <div key={transaction.id} className="flex justify-between items-center p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-4">
                    <img src={transaction.avatar} alt={transaction.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{transaction.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.date} {transaction.time}
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">{transaction.amount}</p>
                </div>
                <div className="flex items-center">
                  <p className={`mr-4 text-sm ${getStatusColorClass(transaction.status)}`}>
                    {transaction.status}
                  </p>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <ChevronDownIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
            {t('stock.quickTransfer', 'Quick Transfer')}
          </h3>

          {/* Contacts pour transferts rapides */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-4 mb-6">
            {contacts.map(contact => (
              <div key={contact.id} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-1 flex-shrink-0">
                  <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{contact.name}</p>
              </div>
            ))}
            <div className="flex-shrink-0">
              <button className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <ChevronRightIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Formulaire de transfert */}
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('stock.cardNumber', 'Card Number')}
              </label>
              <div className="flex">
                <input 
                  type="text" 
                  value={cardInfo.number}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white"
                />
                <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg flex items-center">
                  <span className="text-gray-500 dark:text-gray-400">VISA</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                {t('stock.sendMoney', 'Send Money')}
              </button>
              <button className="flex-1 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600">
                {t('stock.saveAsDraft', 'Save as Draft')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stock; 