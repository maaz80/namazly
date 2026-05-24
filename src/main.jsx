import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Skip to main content — keyboard / screen reader accessibility */}
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
