import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { registerServiceWorker } from './pwa/registerServiceWorker';
import './styles.css';

window.addEventListener('load', () => {
  registerServiceWorker().catch((error) => console.warn('Service Worker registration failed', error));
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

