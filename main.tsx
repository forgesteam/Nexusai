import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initializePWA } from './lib/pwa';
import './styles/main.css';
import AppErrorBoundary from './components/AppErrorBoundary'

initializePWA()

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AppErrorBoundary>,
);
