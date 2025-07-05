import React, { useState } from 'react';

const quickActions = [
  { label: 'Voir le stock', value: 'stock' },
  { label: 'Voir le planning', value: 'planning' },
  { label: 'Afficher la map', value: 'map' },
  { label: 'Voir les disponibilités', value: 'disponibilites' },
];

const McpServer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<{query: string, response: any}[]>([]);
  const [loading, setLoading] = useState(false);

  // Simule une requête IA/backend (à remplacer par un vrai appel API)
  const sendRequest = async (req: string) => {
    setLoading(true);
    setTimeout(() => {
      const fakeResponse = { message: `Réponse simulée pour la requête : "${req}"`, data: { type: req, content: '...' } };
      setResult(fakeResponse);
      setHistory(prev => [{ query: req, response: fakeResponse }, ...prev]);
      setLoading(false);
    }, 800);
  };

  const handleQuickAction = (value: string) => {
    setQuery(value);
    sendRequest(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      sendRequest(query.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-maraudr-lightBg via-blue-50/30 to-orange-50/30 dark:from-maraudr-darkBg dark:via-gray-800 dark:to-gray-900 py-10 px-4">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-maraudr-blue to-maraudr-orange bg-clip-text text-transparent mb-8 text-center">
        Serveur MCP
      </h1>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2 max-w-2xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 border-2 border-maraudr-blue dark:border-maraudr-orange rounded focus:outline-none focus:ring-2 focus:ring-maraudr-blue dark:focus:ring-maraudr-orange bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Tapez une requête (ex: stock, planning, map...)"
        />
        <button type="submit" className="px-4 py-2 bg-gradient-to-r from-maraudr-blue to-maraudr-orange text-white rounded font-semibold hover:from-maraudr-orange hover:to-maraudr-blue transition-all" disabled={loading}>
          Envoyer
        </button>
      </form>
      <div className="mb-8 flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
        {quickActions.map(action => (
          <button
            key={action.value}
            onClick={() => handleQuickAction(action.value)}
            className="px-4 py-2 bg-maraudr-blue/10 dark:bg-maraudr-orange/10 text-maraudr-blue dark:text-maraudr-orange rounded font-semibold hover:bg-maraudr-blue hover:text-white dark:hover:bg-maraudr-orange dark:hover:text-white transition-all border border-maraudr-blue/20 dark:border-maraudr-orange/20"
            disabled={loading}
          >
            {action.label}
          </button>
        ))}
      </div>
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="text-lg font-semibold text-maraudr-blue dark:text-maraudr-orange mb-2">Résultat :</div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 min-h-[80px] text-sm font-mono overflow-x-auto border border-maraudr-blue/10 dark:border-maraudr-orange/10">
          {loading ? (
            <span className="text-gray-400">Chargement...</span>
          ) : result ? (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          ) : (
            <span className="text-gray-400">Aucun résultat pour l'instant.</span>
          )}
        </div>
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="text-lg font-semibold text-maraudr-blue dark:text-maraudr-orange mb-2">Historique des requêtes :</div>
        <div className="bg-white dark:bg-gray-800 rounded p-4 max-h-48 overflow-y-auto text-xs border border-maraudr-blue/10 dark:border-maraudr-orange/10">
          {history.length === 0 ? (
            <span className="text-gray-400">Aucune requête envoyée.</span>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-bold text-maraudr-blue dark:text-maraudr-orange">{item.query}</div>
                <pre className="bg-gray-50 dark:bg-gray-900 rounded p-2 mt-1 border border-maraudr-blue/10 dark:border-maraudr-orange/10">{JSON.stringify(item.response, null, 2)}</pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default McpServer; 