/**
 * LiveSimulators Web Audio Synthesizer Engine
 * Pure client-side procedural sound generation using the native browser Web Audio API.
 * 0kb external audio files, 0ms network latency, calibrated for authentic industrial hardware.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('livesimulators_audio_muted');
      // Default to unmuted (false) or restore user preference
      this.isMuted = stored === 'true';
    }
  }

  /**
   * Initializes or resumes the AudioContext on user interaction
   */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('livesimulators_audio_muted', muted ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('livesimulators:audio_change', { detail: { isMuted: muted } }));
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Crisp electromechanical relay click (e.g. pilot relay, auxiliary contact switch)
   */
  public playRelayClick(volume = 0.25): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High-frequency impact transient
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

      gain.gain.setValueAtTime(volume * 0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);

      // Micro metallic rattle follower
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const now2 = this.ctx.currentTime;
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(850, now2);
        osc2.frequency.exponentialRampToValueAtTime(200, now2 + 0.02);
        gain2.gain.setValueAtTime(volume * 0.4, now2);
        gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.025);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now2);
        osc2.stop(now2 + 0.03);
      }, 15);
    } catch {
      // AudioContext failure fallback
    }
  }

  /**
   * Heavy Air Circuit Breaker (ACB) / Vacuum Circuit Breaker (VCB) Trip
   * Pneumatic release thud (90Hz) followed by metallic latch snap.
   */
  public playBreakerTrip(volume = 0.35): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Heavy resonant pneumatic impact (sub-bass transient)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(120, now);
      subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.14);

      subGain.gain.setValueAtTime(volume * 1.2, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.17);

      // 2. High-energy mechanical spring latch snap (filtered noise burst)
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(3.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.7, now + 0.01);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start(now + 0.01);
      whiteNoise.stop(now + 0.1);
    } catch {
      // AudioContext failure fallback
    }
  }

  /**
   * Electrical Arc Flash / Plasma Ionization Crackle
   * Violent short-circuit arc burst filtered between 600Hz - 4.5kHz.
   */
  public playArcFlash(volume = 0.35): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.22;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Distorted plasma crackle noise
      for (let i = 0; i < bufferSize; i++) {
        const raw = Math.random() * 2 - 1;
        // Non-linear clipping to simulate spark crackles
        data[i] = Math.tanh(raw * 3.5);
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(700, now + duration);
      filter.Q.setValueAtTime(1.8, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 1.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);

      // Accompany with low-frequency explosive blast wave
      const boom = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boom.type = 'sawtooth';
      boom.frequency.setValueAtTime(95, now);
      boom.frequency.exponentialRampToValueAtTime(30, now + 0.18);
      boomGain.gain.setValueAtTime(volume * 0.9, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      boom.connect(boomGain);
      boomGain.connect(ctx.destination);
      boom.start(now);
      boom.stop(now + 0.21);
    } catch {
      // AudioContext failure fallback
    }
  }

  /**
   * Industrial Substation Warning Annunciator Chirp
   * High-contrast dual-tone alert (1800Hz / 2400Hz).
   */
  public playAlarmChirp(volume = 0.25): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.setValueAtTime(1760, now + 0.05);

      gain.gain.setValueAtTime(volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // AudioContext failure fallback
    }
  }
}

export const soundEngine = new AudioSynthesizer();
