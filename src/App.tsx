import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { ScrollHint } from './components/ScrollHint';

export default function App() {
  const { i18n } = useTranslation();

  // Keep <html lang> in sync with the active locale.
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="app">
      <Navbar />

      <main className="app__main">
        <Hero />
      </main>

      <Footer />

      <ScrollHint />
    </div>
  );
}
