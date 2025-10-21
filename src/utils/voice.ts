// === 📁 src/utils/voice.ts ===
import { VoiceConfig } from '@/types/common';

class VoiceManager {
  private config: VoiceConfig = { enabled: false, lang: 'ru-RU' };
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  setConfig(config: VoiceConfig) {
    this.config = config;
  }

  speak(text: string) {
    if (!this.config.enabled || !this.synth) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.config.lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    this.synth.speak(utterance);
  }

  success(message: string = 'Успешно') {
    this.speak(message);
  }

  error(message: string = 'Ошибка') {
    this.speak(message);
  }

  warning(message: string = 'Внимание') {
    this.speak(message);
  }
}

export const voiceManager = new VoiceManager();



