import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker and Add-to-Home-Screen prompt support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e: Event) => {
  // @ts-ignore Chrome-only
  (e as any).preventDefault?.();
  // deferredPrompt = e;
  window.dispatchEvent(new CustomEvent('cabe-a2hs-available'));
});
