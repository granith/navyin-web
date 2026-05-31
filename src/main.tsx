import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './i18n/config';
import './styles/global.css';
import App from './App';
import { CountryProvider } from './i18n/CountryProvider';
import { SoundProvider } from './sound/SoundProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SoundProvider>
      <CountryProvider>
        <App />
      </CountryProvider>
    </SoundProvider>
  </StrictMode>
);
