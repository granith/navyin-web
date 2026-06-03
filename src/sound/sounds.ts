/**
 * Sound registry. Each named sound is either:
 *   - `synth`: generated on the fly with the Web Audio API (no asset needed), or
 *   - `file`:  loaded from a URL under /public (e.g. "/sounds/click.mp3").
 *
 * The defaults are synthesized so the boilerplate makes sound out of the box.
 * To use real audio, drop files in `public/sounds/` and switch a def to:
 *   click: { kind: "file", src: "/sounds/click.mp3" },
 */

export type SynthSpec = {
  /** Oscillator waveform. */
  type?: OscillatorType;
  /** Starting frequency in Hz. */
  frequency: number;
  /** Length of the sound in seconds. */
  duration: number;
  /** Peak gain, 0–1. Keep UI ticks low (~0.05–0.12). */
  gain?: number;
  /** Optional end frequency for a pitch glide. */
  sweep?: number;
};

export type SoundDef =
  | { kind: 'synth'; spec: SynthSpec }
  | { kind: 'file'; src: string };

export type SoundName =
  | 'hover'
  | 'click'
  | 'toggle'
  | 'cell'
  | 'appear'
  | 'glitch';

export const sounds: Record<SoundName, SoundDef> = {
  hover: {
    kind: 'synth',
    spec: { type: 'sine', frequency: 880, duration: 0.06, gain: 0.05 }
  },
  // Hero grid cell hover SFX (light-switch click).
  cell: { kind: 'file', src: '/sounds/light-switch.mp3' },
  // Showcase card hover SFX (image expands into view).
  appear: { kind: 'file', src: '/sounds/appear.mp3' },
  // Partnership card hover SFX.
  click: {
    kind: 'synth',
    spec: {
      type: 'triangle',
      frequency: 520,
      sweep: 320,
      duration: 0.12,
      gain: 0.12
    }
  },
  toggle: {
    kind: 'synth',
    spec: { type: 'sine', frequency: 660, duration: 0.1, gain: 0.1 }
  },
  // Drop /public/sounds/glitch.mp3 to replace; engine fails silent until then.
  glitch: { kind: 'file', src: '/sounds/glitch.mp3' }
};
