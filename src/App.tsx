import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Logos } from './components/Logos';
import { Showcase } from './components/Showcase';
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
        <Logos />
        <Showcase />
      </main>

      <Footer />

      <ScrollHint />
    </div>
  );
}
