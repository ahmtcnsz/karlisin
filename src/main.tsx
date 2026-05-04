import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Global error logger to help debug "Script error." issues
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[Global Error]:', { message, source, lineno, colno, error });
  return false;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
