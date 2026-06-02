import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Logos } from './components/Logos';
import { Showcase } from './components/Showcase';
import { Services } from './components/Services';
import { Partnerships } from './components/Partnerships';
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
        <Services />
        <Partnerships />
      </main>

      <Footer />

      <ScrollHint />
    </div>
  );
}
