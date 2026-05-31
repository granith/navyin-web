import { sounds, type SoundName, type SynthSpec } from './sounds';

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/**
 * Framework-agnostic Web Audio engine. Handles the autoplay policy (the
 * context must be created/resumed inside a user gesture via `unlock()`),
 * caches decoded file buffers, and routes everything through a master gain.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private muted = false;
  private volume: number;

  constructor(volume = 0.7) {
    this.volume = volume;
  }

  /** Create + resume the context. Call this from a user gesture. */
  async unlock(): Promise<void> {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
      if (!Ctor) return; // Web Audio unsupported — fail silent.
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    await this.preloadFiles();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  play(name: SoundName): void {
    if (this.muted || !this.ctx || !this.master) return;
    const def = sounds[name];
    if (def.kind === 'synth') {
      this.playSynth(def.spec);
    } else {
      void this.playBuffer(def.src);
    }
  }

  private playSynth(spec: SynthSpec): void {
    const ctx = this.ctx!;
    const master = this.master!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = spec.type ?? 'sine';
    osc.frequency.setValueAtTime(spec.frequency, now);
    if (spec.sweep) {
      osc.frequency.exponentialRampToValueAtTime(
        spec.sweep,
        now + spec.duration,
      );
    }

    const peak = spec.gain ?? 0.1;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + spec.duration);

    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + spec.duration + 0.02);
  }

  private async loadBuffer(src: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null;
    const cached = this.buffers.get(src);
    if (cached) return cached;
    const res = await fetch(src);
    const arr = await res.arrayBuffer();
    const buffer = await this.ctx.decodeAudioData(arr);
    this.buffers.set(src, buffer);
    return buffer;
  }

  private async playBuffer(src: string): Promise<void> {
    const buffer = await this.loadBuffer(src);
    if (!buffer || !this.ctx || !this.master) return;
    const node = this.ctx.createBufferSource();
    node.buffer = buffer;
    node.connect(this.master);
    node.start();
  }

  /** Warm the cache for any file-based sounds so the first play is instant. */
  private async preloadFiles(): Promise<void> {
    await Promise.all(
      Object.values(sounds)
        .filter((d) => d.kind === 'file')
        .map((d) => this.loadBuffer(d.src).catch(() => null)),
    );
  }
}
