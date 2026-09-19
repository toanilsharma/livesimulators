// High-Tech Engineering Acoustic Feedback Synthesizer using Web Audio API
// Generates authentic, pleasant physical acoustic feedback for engineering simulators

class PhysicsAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Start muted by default to respect user audio policy
  private masterGain: GainNode | null = null;
  private activeOsc: OscillatorNode | null = null;
  private activeGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.18, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public updateTone(type: string, freqHz: number, intensity: number = 0.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const clampedFreq = Math.max(30, Math.min(1800, freqHz));
    const targetVol = Math.max(0.01, Math.min(0.25, intensity * 0.2));

    if (!this.activeOsc) {
      try {
        this.activeOsc = this.ctx.createOscillator();
        this.activeGain = this.ctx.createGain();
        this.filterNode = this.ctx.createBiquadFilter();

        // Warm lowpass filter to remove harshness
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(2400, this.ctx.currentTime);

        this.activeOsc.type = type === 'three_phase' || type === 'harmonic' ? 'triangle' : 'sine';
        this.activeOsc.frequency.setValueAtTime(clampedFreq, this.ctx.currentTime);

        this.activeGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.activeGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);

        this.activeOsc.connect(this.filterNode);
        this.filterNode.connect(this.activeGain);
        this.activeGain.connect(this.masterGain);
        this.activeOsc.start();
      } catch {
        // Audio policy or device limitation
      }
    } else {
      try {
        this.activeOsc.frequency.setTargetAtTime(clampedFreq, this.ctx.currentTime, 0.08);
        if (this.activeGain) {
          this.activeGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.08);
        }
      } catch {
        // Ignored
      }
    }
  }

  public playClick(pitch: number = 440) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {
      // Ignored
    }
  }

  public stopAll() {
    if (this.activeGain && this.ctx) {
      this.activeGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
    setTimeout(() => {
      if (this.activeOsc) {
        try {
          this.activeOsc.stop();
          this.activeOsc.disconnect();
        } catch {
          // Ignored
        }
        this.activeOsc = null;
      }
    }, 80);
  }
}

export const physicsAudio = new PhysicsAudioEngine();
