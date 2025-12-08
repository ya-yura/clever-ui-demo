// === 📁 src/behavior/microRewards.ts ===
// Micro-rewards system for positive reinforcement

import { vibrate } from '@/utils/vibration';
import { playSound } from '@/utils/sound';
import { speak } from '@/utils/voice';

export interface MicroReward {
  type: 'visual' | 'haptic' | 'audio' | 'voice' | 'combined';
  message?: string;
  intensity: 'subtle' | 'normal' | 'strong';
}

/**
 * Show micro-reward for completed action
 */
export function showMicroReward(
  action: 'scan' | 'complete_line' | 'complete_document' | 'milestone',
  options: Partial<MicroReward> = {}
): void {
  const reward: MicroReward = {
    type: options.type || 'combined',
    intensity: options.intensity || 'normal',
    message: options.message,
  };

  switch (action) {
    case 'scan':
      showScanReward(reward);
      break;
    case 'complete_line':
      showLineCompleteReward(reward);
      break;
    case 'complete_document':
      showDocumentCompleteReward(reward);
      break;
    case 'milestone':
      showMilestoneReward(reward);
      break;
  }
}

/**
 * Reward for successful scan
 */
function showScanReward(reward: MicroReward): void {
  // Subtle feedback
  if (reward.type === 'haptic' || reward.type === 'combined') {
    vibrate(30);
  }
  
  if (reward.type === 'audio' || reward.type === 'combined') {
    playSound('scan_success');
  }

  if (reward.type === 'visual' || reward.type === 'combined') {
    showVisualFeedback('✓', 'text-success');
  }
}

/**
 * Reward for completing a line item
 */
function showLineCompleteReward(reward: MicroReward): void {
  if (reward.type === 'haptic' || reward.type === 'combined') {
    vibrate(50);
  }
  
  if (reward.type === 'audio' || reward.type === 'combined') {
    playSound('complete');
  }

  if (reward.type === 'voice' || reward.type === 'combined') {
    speak('Позиция выполнена');
  }

  if (reward.type === 'visual' || reward.type === 'combined') {
    const messages = [
      'Отлично!',
      'Превосходно!',
      'Продолжайте!',
      'Хорошая работа!',
    ];
    const message = reward.message || messages[Math.floor(Math.random() * messages.length)];
    showVisualFeedback(message, 'text-success', 1500);
  }
}

/**
 * Reward for completing a document
 */
function showDocumentCompleteReward(reward: MicroReward): void {
  if (reward.type === 'haptic' || reward.type === 'combined') {
    // Pattern vibration
    vibrate([100, 50, 100, 50, 200]);
  }
  
  if (reward.type === 'audio' || reward.type === 'combined') {
    playSound('success');
  }

  if (reward.type === 'voice' || reward.type === 'combined') {
    speak('Документ завершён. Отличная работа!');
  }

  if (reward.type === 'visual' || reward.type === 'combined') {
    showCelebration();
  }
}

/**
 * Reward for reaching milestone
 */
function showMilestoneReward(reward: MicroReward): void {
  if (reward.type === 'haptic' || reward.type === 'combined') {
    vibrate([50, 30, 50, 30, 100]);
  }
  
  if (reward.type === 'audio' || reward.type === 'combined') {
    playSound('milestone');
  }

  if (reward.type === 'voice' || reward.type === 'combined') {
    const message = reward.message || 'Отлично! Продолжайте в том же духе';
    speak(message);
  }

  if (reward.type === 'visual' || reward.type === 'combined') {
    const message = reward.message || '🎉 Отлично! Ещё чуть-чуть!';
    showVisualFeedback(message, 'text-brand-primary', 2000);
  }
}

/**
 * Show visual feedback toast
 */
function showVisualFeedback(
  message: string,
  className: string = 'text-content-primary',
  duration: number = 1000
): void {
  const toast = document.createElement('div');
  toast.className = `fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-surface-secondary border border-surface-tertiary rounded-lg shadow-lg z-50 font-semibold ${className} animate-bounce-in`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Show celebration animation
 */
function showCelebration(): void {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 pointer-events-none z-50 flex items-center justify-center';
  overlay.innerHTML = `
    <div class="animate-scale-in">
      <div class="text-8xl animate-bounce">🎉</div>
      <div class="text-2xl font-bold text-success mt-4 text-center animate-fade-in">
        Документ завершён!
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add('animate-fade-out');
    setTimeout(() => overlay.remove(), 500);
  }, 2000);
}

/**
 * Show progress milestone notification
 */
export function showProgressMilestone(
  completed: number,
  total: number
): void {
  const percent = Math.round((completed / total) * 100);
  
  // Show at 25%, 50%, 75%, 90%
  if (percent === 25 || percent === 50 || percent === 75 || percent === 90) {
    const remaining = total - completed;
    const message = remaining === 1
      ? 'Осталась последняя позиция!'
      : `Отлично! Осталось ${remaining} позиций`;
    
    showMicroReward('milestone', {
      message,
      intensity: 'normal',
    });
  }
}

/**
 * Encourage operator when they're slowing down
 */
export function showEncouragement(reason: 'slow' | 'errors' | 'idle'): void {
  const messages = {
    slow: [
      'Не торопитесь, главное — точность',
      'Вы отлично справляетесь',
      'Осталось совсем немного',
    ],
    errors: [
      'Проверяйте штрихкод перед сканированием',
      'Не спешите, будьте внимательны',
      'Точность важнее скорости',
    ],
    idle: [
      'Продолжайте сканирование',
      'Готов к работе',
    ],
  };

  const messageList = messages[reason];
  const message = messageList[Math.floor(Math.random() * messageList.length)];

  showVisualFeedback(message, 'text-content-secondary', 2500);
}


