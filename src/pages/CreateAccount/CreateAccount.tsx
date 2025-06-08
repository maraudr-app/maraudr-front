import React from 'react';

const CreateAccount: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-maraudr-lightBg dark:bg-maraudr-darkBg">
      <div className="p-8 rounded shadow-md w-full max-w-md bg-white dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center text-maraudr-darkText dark:text-maraudr-lightText">Créer un compte</h2>
        {/* Le contenu du formulaire viendra ici */}
      </div>
    </div>
  );
};

export default CreateAccount; 