import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './i18n/config';
import './styles/global.css';
import App from './App';
import { CountryProvider } from './i18n/CountryProvider';
import { SoundProvider } from './sound/SoundProvider';

// Start every load at the top. The pinned, scroll-jacked sections (Services,
// Locations) only inflate the page height after they mount, so the browser's
// native scroll restoration runs against the wrong height and lands in the
// wrong place (often mid-Locations). Owning the initial position avoids that.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SoundProvider>
      <CountryProvider>
        <App />
      </CountryProvider>
    </SoundProvider>
  </StrictMode>
);
