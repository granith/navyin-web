import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

export default function App() {
  const { t, i18n } = useTranslation();

  // Keep <html lang> in sync with the active locale.
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="app">
      <Navbar />

      <main className="app__main">
        {/* Minimal Motion example — replace with your own sections. */}
        <motion.h1
          className="app__title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {t('app.title')}
        </motion.h1>
      </main>

      <Footer />
    </div>
  );
}
