import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';

import { SoundEngine } from './engine';
import type { SoundName } from './sounds';

type SoundContextValue = {
  /** Trigger a registered sound by name. */
  play: (name: SoundName) => void;
  /** Whether sound is currently on. */
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  toggle: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

const STORAGE_KEY = 'navyin:sound';

function getInitialEnabled(): boolean {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'on';
  // No saved choice yet: default off when the user prefers reduced motion.
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<SoundEngine | null>(null);
  const engine = (engineRef.current ??= new SoundEngine());

  const [enabled, setEnabledState] = useState(getInitialEnabled);

  // Mute the engine and persist the choice synchronously on every change.
  const setEnabled = useMemo(
    () => (value: boolean) => {
      engine.setMuted(!value);
      window.localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off');
      setEnabledState(value);
    },
    [engine]
  );

  // Apply the initial mute state once on mount. (Subsequent changes go through
  // setEnabled, which mutes the engine synchronously — so `enabled` is
  // intentionally read only at mount here.)
  useEffect(() => {
    engine.setMuted(!enabled);
  }, [engine]);

  // Unlock the audio context on the first user gesture (autoplay policy).
  useEffect(() => {
    const unlock = () => void engine.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [engine]);

  const value = useMemo<SoundContextValue>(
    () => ({
      play: (name) => engine.play(name),
      enabled,
      setEnabled,
      toggle: () => setEnabled(!enabled)
    }),
    [engine, enabled, setEnabled]
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within <SoundProvider>');
  return ctx;
}

/**
 * Convenience handlers to spread onto any interactive element:
 *   <button {...useUiSound()}>…</button>
 */
export function useUiSound() {
  const { play } = useSound();
  return {
    onMouseEnter: () => play('hover'),
    onPointerDown: () => play('click')
  };
}
