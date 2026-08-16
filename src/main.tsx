import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { SearchQueryProvider } from '@/hooks/SearchQueryContext';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <SearchQueryProvider>
          <App />
        </SearchQueryProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
);
