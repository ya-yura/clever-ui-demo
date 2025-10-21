// === 📁 src/utils/sound.ts ===
import { SoundConfig } from '@/types/common';

class SoundManager {
  private context: AudioContext | null = null;
  private config: SoundConfig = { enabled: true, volume: 0.7 };

  setConfig(config: SoundConfig) {
    this.config = config;
  }

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  private playTone(frequency: number, duration: number) {
    if (!this.config.enabled) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.config.volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (error) {
      console.error('Sound playback error:', error);
    }
  }

  success() {
    this.playTone(800, 100);
  }

  error() {
    this.playTone(300, 200);
    setTimeout(() => this.playTone(200, 200), 150);
  }

  warning() {
    this.playTone(500, 150);
  }

  scan() {
    this.playTone(1000, 50);
  }

  complete() {
    this.playTone(600, 100);
    setTimeout(() => this.playTone(800, 100), 100);
    setTimeout(() => this.playTone(1000, 150), 200);
  }
}

export const soundManager = new SoundManager();



