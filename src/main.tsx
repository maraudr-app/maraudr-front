import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Importer la configuration i18n
import './i18n/i18n'
import { LoadingTranslations } from './components/LoadingTranslations'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingTranslations />}>
      <App />
    </Suspense>
  </StrictMode>,
)
