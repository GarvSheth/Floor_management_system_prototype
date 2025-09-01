// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. Wrap your App component */}
    <Auth0Provider
      domain="dev-ae4h58pfh84z80vq.us.auth0.com"       // <-- 3. Add your Domain from Auth0
      clientId="zNCrNORlfnckwKZxhoh4V4ETotzeWItq" // <-- 4. Add your Client ID from Auth0
      redirectUri= {window.location.origin}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);