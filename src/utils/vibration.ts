// === 📁 src/utils/vibration.ts ===
import { VibrationConfig } from '@/types/common';

class VibrationManager {
  private config: VibrationConfig = { enabled: true, duration: 100 };

  setConfig(config: VibrationConfig) {
    this.config = config;
  }

  private vibrate(pattern: number | number[]) {
    if (!this.config.enabled) return;
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  success() {
    this.vibrate(this.config.duration);
  }

  error() {
    this.vibrate([this.config.duration, 50, this.config.duration]);
  }

  warning() {
    this.vibrate([50, 50, 50]);
  }

  scan() {
    this.vibrate(50);
  }
}

export const vibrationManager = new VibrationManager();



