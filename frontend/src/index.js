import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './i18n';
import { useTranslation } from 'react-i18next';

const root = ReactDOM.createRoot(document.getElementById('root'));
const {t} = useTranslation();
root.render(
  <React.StrictMode>
    <React.Suspense fallback={t('loading')}>
      <App />
    </React.Suspense>
  </React.StrictMode>
);

reportWebVitals(console.log);
reportWebVitals(sendToAnalytics);
