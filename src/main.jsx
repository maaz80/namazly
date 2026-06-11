import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Skip to main content — keyboard / screen reader accessibility */}
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
    <App />
  </React.StrictMode>
);

// Register Progressive Web App Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('✅ Service Worker registered successfully on scope:', reg.scope);
      })
      .catch((err) => {
        console.error('❌ Service Worker registration failed:', err);
      });
  });
}
