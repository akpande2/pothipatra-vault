import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppWithOnboarding } from './AppWithOnboarding';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithOnboarding>
      <App />
    </AppWithOnboarding>
  </React.StrictMode>
);
