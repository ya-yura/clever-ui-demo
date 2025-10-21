// === 📁 src/utils/feedback.ts ===
import { soundManager } from './sound';
import { vibrationManager } from './vibration';
import { voiceManager } from './voice';

export const feedback = {
  success(message?: string) {
    soundManager.success();
    vibrationManager.success();
    if (message) voiceManager.success(message);
  },

  error(message?: string) {
    soundManager.error();
    vibrationManager.error();
    if (message) voiceManager.error(message);
  },

  warning(message?: string) {
    soundManager.warning();
    vibrationManager.warning();
    if (message) voiceManager.warning(message);
  },

  scan() {
    soundManager.scan();
    vibrationManager.scan();
  },

  complete(message?: string) {
    soundManager.complete();
    vibrationManager.success();
    if (message) voiceManager.success(message);
  }
};



