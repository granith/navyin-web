import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Logos } from './components/Logos';
import { Showcase } from './components/Showcase';
import { Services } from './components/Services';
import { Partnerships } from './components/Partnerships';
import { Technologies } from './components/Technologies';
import { Benefits } from './components/Benefits';
import { Testimonials } from './components/Testimonials';
import { Locations } from './components/Locations';
import { Contact } from './components/Contact';
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
        <Technologies />
        <Testimonials />
        <Benefits />
        <Locations />
        <Contact />
      </main>

      <Footer />

      <ScrollHint />
    </div>
  );
}
