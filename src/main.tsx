import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRoutes } from './routes/AppRoutes'
import { ErrorBoundary } from './components/ErrorBoundary'
// import { TestApp } from './TestApp' // Descomente para testar

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppRoutes />
      {/* Descomente para testar: <TestApp /> */}
    </ErrorBoundary>
  </StrictMode>,
)
