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
import { GlassCursor } from './components/GlassCursor';
import { useScrollReveal } from './hooks/useScrollReveal';

export default function App() {
  const { i18n } = useTranslation();

  // Reveal sections as they scroll into view (no-op under reduced motion).
  useScrollReveal();

  // Land at the top on load. Paired with history.scrollRestoration='manual'
  // (main.tsx): the pinned sections resize the page after mount, so any restored
  // position would be wrong — most often dumping the user into Locations.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      <GlassCursor />
    </div>
  );
}
