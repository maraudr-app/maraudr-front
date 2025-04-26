import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Importer la configuration i18n
import './i18n/i18n'

// Loading placeholder pour le chargement des traductions
const LoadingTranslations = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingTranslations />}>
      <App />
    </Suspense>
  </StrictMode>,
)
