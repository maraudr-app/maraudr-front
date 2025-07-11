import React, { useEffect } from 'react';
import { debugApiUrls } from '../../config/api';

const ApiConfigDebug: React.FC = () => {
  useEffect(() => {
    debugApiUrls();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">🔧 Configuration API Debug</h3>
      <p className="text-sm text-gray-600">
        Ouvrez la console du navigateur pour voir les URLs générées
      </p>
    </div>
  );
};

export default ApiConfigDebug; 