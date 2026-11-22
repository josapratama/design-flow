import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { PolyglotProvider } from './i18n/PolyglotContext';
import { DialogProvider } from './components/dialogs/DialogProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PolyglotProvider>
      <DialogProvider>
        <App />
      </DialogProvider>
    </PolyglotProvider>
  </React.StrictMode>
);
