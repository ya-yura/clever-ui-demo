// === 📁 src/utils/soundEffects.ts ===
// Sound effects for scanning feedback

/**
 * Sound types for inventory scanning
 */
export type ScanSound = 'found' | 'notListed' | 'extra';

/**
 * Play a beep sound with different frequencies for different statuses
 */
export class SoundEffects {
  private static audioContext: AudioContext | null = null;

  private static getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Play a sound based on scan result
   */
  static playScanSound(type: ScanSound, volume: number = 0.3): void {
    try {
      const context = this.getContext();
      
      // Create oscillator (tone generator)
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      // Set volume
      gainNode.gain.value = volume;
      
      const now = context.currentTime;
      
      switch (type) {
        case 'found':
          // Success: Single high beep (800Hz)
          oscillator.frequency.setValueAtTime(800, now);
          oscillator.start(now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          oscillator.stop(now + 0.15);
          break;
          
        case 'notListed':
          // Warning: Two medium beeps (600Hz, 500Hz)
          oscillator.frequency.setValueAtTime(600, now);
          oscillator.frequency.setValueAtTime(500, now + 0.1);
          oscillator.start(now);
          gainNode.gain.setValueAtTime(volume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          gainNode.gain.setValueAtTime(volume, now + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          oscillator.stop(now + 0.2);
          break;
          
        case 'extra':
          // Error: Low buzzing beep (400Hz)
          oscillator.frequency.setValueAtTime(400, now);
          oscillator.start(now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          oscillator.stop(now + 0.25);
          break;
      }
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  /**
   * Play success sound
   */
  static playSuccess(): void {
    this.playScanSound('found');
  }

  /**
   * Play warning sound
   */
  static playWarning(): void {
    this.playScanSound('notListed');
  }

  /**
   * Play error sound
   */
  static playError(): void {
    this.playScanSound('extra');
  }

  /**
   * Play a custom beep
   */
  static playBeep(frequency: number = 800, duration: number = 0.15, volume: number = 0.3): void {
    try {
      const context = this.getContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = frequency;
      gainNode.gain.value = volume;
      
      const now = context.currentTime;
      oscillator.start(now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
      oscillator.stop(now + duration);
    } catch (error) {
      console.warn('Beep playback failed:', error);
    }
  }
}

// Convenience exports
export const playScanSound = SoundEffects.playScanSound.bind(SoundEffects);
export const playSuccess = SoundEffects.playSuccess.bind(SoundEffects);
export const playWarning = SoundEffects.playWarning.bind(SoundEffects);
export const playError = SoundEffects.playError.bind(SoundEffects);
export const playBeep = SoundEffects.playBeep.bind(SoundEffects);










