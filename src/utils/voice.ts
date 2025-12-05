// === 📁 src/utils/voice.ts ===
// Voice synthesis utilities for warehouse operations

/**
 * Voice settings for warehouse environment
 */
export interface VoiceSettings {
  enabled: boolean;
  volume: number; // 0-1
  rate: number; // 0.5-2
  pitch: number; // 0-2
  lang: string;
}

/**
 * Voice Service for warehouse operations
 * Uses Web Speech API for text-to-speech
 */
export class VoiceService {
  private static synthesis: SpeechSynthesis | null = null;
  private static settings: VoiceSettings = {
    enabled: false,
    volume: 1.0,
    rate: 1.0,
    pitch: 1.0,
    lang: 'ru-RU',
  };

  private static getSynthesis(): SpeechSynthesis | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null;
    }
    if (!this.synthesis) {
      this.synthesis = window.speechSynthesis;
    }
    return this.synthesis;
  }

  /**
   * Check if voice is supported
   */
  static isSupported(): boolean {
    return this.getSynthesis() !== null;
  }

  /**
   * Update voice settings
   */
  static updateSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
    // Save to localStorage
    try {
      localStorage.setItem('voice_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save voice settings:', error);
    }
  }

  /**
   * Load settings from localStorage
   */
  static loadSettings(): VoiceSettings {
    try {
      const stored = localStorage.getItem('voice_settings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load voice settings:', error);
    }
    return this.settings;
  }

  /**
   * Get current settings
   */
  static getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  /**
   * Speak text with current settings
   */
  static speak(text: string, options?: Partial<VoiceSettings>): void {
    const synthesis = this.getSynthesis();
    if (!synthesis || !this.settings.enabled) {
      return;
    }

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const settings = { ...this.settings, ...options };

    utterance.volume = settings.volume;
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.lang = settings.lang;

    synthesis.speak(utterance);
  }

  /**
   * Speak cell instruction for warehouse picking
   */
  static speakCell(cellName: string): void {
    this.speak(`Следующая ячейка ${cellName}`);
  }

  /**
   * Speak product added
   */
  static speakProductAdded(productName: string): void {
    this.speak(`Добавлен ${productName}`);
  }

  /**
   * Speak cell completed
   */
  static speakCellCompleted(cellName: string): void {
    this.speak(`Ячейка ${cellName} завершена`);
  }

  /**
   * Speak error
   */
  static speakError(message: string): void {
    this.speak(`Ошибка. ${message}`, { pitch: 0.8, rate: 0.9 });
  }

  /**
   * Speak success
   */
  static speakSuccess(message: string): void {
    this.speak(message, { pitch: 1.2 });
  }

  /**
   * Stop speaking
   */
  static stop(): void {
    const synthesis = this.getSynthesis();
    if (synthesis) {
      synthesis.cancel();
    }
  }
}

// Convenience exports
export const speakCell = VoiceService.speakCell.bind(VoiceService);
export const speakProductAdded = VoiceService.speakProductAdded.bind(VoiceService);
export const speakCellCompleted = VoiceService.speakCellCompleted.bind(VoiceService);
export const speakError = VoiceService.speakError.bind(VoiceService);
export const speakSuccess = VoiceService.speakSuccess.bind(VoiceService);
export const speak = VoiceService.speak.bind(VoiceService);
