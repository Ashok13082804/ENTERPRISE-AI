// Procedural Web Audio Sound Generator for all 432 games
class SoundFXManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  public playTone(freq: number, type: OscillatorType, duration: number, startVol = 0.15, endVol = 0.001) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(endVol, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Preset sounds for games
  public playJump() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  public playScore() {
    if (this.isMuted) return;
    this.playTone(587.33, 'triangle', 0.1, 0.2); // D5
    setTimeout(() => this.playTone(880, 'triangle', 0.15, 0.25), 90); // A5
  }

  public playHit() {
    this.playTone(180, 'sawtooth', 0.08, 0.25);
  }

  public playShoot() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  public playExplosion() {
    this.playTone(75, 'sawtooth', 0.3, 0.35);
  }

  public playGameOver() {
    this.playTone(300, 'sawtooth', 0.15, 0.25);
    setTimeout(() => this.playTone(220, 'sawtooth', 0.2, 0.25), 160);
    setTimeout(() => this.playTone(140, 'sawtooth', 0.4, 0.3), 340);
  }

  public playWin() {
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((n, idx) => {
      setTimeout(() => this.playTone(n, 'triangle', 0.18, 0.2), idx * 100);
    });
  }

  public playMove() {
    this.playTone(400, 'sine', 0.05, 0.1);
  }
}

export const soundManager = new SoundFXManager();
