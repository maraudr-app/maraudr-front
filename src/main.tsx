import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Importer la configuration i18n
import './i18n/i18n'
import { LoadingTranslations } from './components/LoadingTranslations'
import { tokenManager } from './services/tokenManager'

// Démarrer le monitoring des tokens
tokenManager.startTokenMonitoring();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingTranslations />}>
      <App />
    </Suspense>
  </StrictMode>,
)
