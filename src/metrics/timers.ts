// === 📁 src/metrics/timers.ts ===
// Timer utilities for measuring operation durations

export class MetricsTimer {
  private name: string;
  private startTime: number;
  private endTime: number | null = null;
  private paused: boolean = false;
  private pausedDuration: number = 0;
  private pauseStartTime: number | null = null;

  constructor(name: string) {
    this.name = name;
    this.startTime = Date.now();
  }

  /**
   * Stop the timer and get duration
   */
  stop(): number {
    if (this.endTime) {
      return this.getDuration();
    }

    if (this.paused) {
      this.resume();
    }

    this.endTime = Date.now();
    return this.getDuration();
  }

  /**
   * Pause the timer
   */
  pause(): void {
    if (this.paused || this.endTime) return;

    this.paused = true;
    this.pauseStartTime = Date.now();
  }

  /**
   * Resume the timer
   */
  resume(): void {
    if (!this.paused || this.endTime) return;

    if (this.pauseStartTime) {
      this.pausedDuration += Date.now() - this.pauseStartTime;
    }

    this.paused = false;
    this.pauseStartTime = null;
  }

  /**
   * Get current duration (excluding paused time)
   */
  getDuration(): number {
    const end = this.endTime || Date.now();
    const total = end - this.startTime;
    
    let pausedTime = this.pausedDuration;
    if (this.paused && this.pauseStartTime) {
      pausedTime += Date.now() - this.pauseStartTime;
    }

    return total - pausedTime;
  }

  /**
   * Get timer name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Check if timer is running
   */
  isRunning(): boolean {
    return !this.paused && !this.endTime;
  }

  /**
   * Check if timer is paused
   */
  isPaused(): boolean {
    return this.paused;
  }

  /**
   * Get start time
   */
  getStartTime(): number {
    return this.startTime;
  }

  /**
   * Get end time (null if not stopped)
   */
  getEndTime(): number | null {
    return this.endTime;
  }
}

/**
 * Timer manager for multiple concurrent timers
 */
export class TimerManager {
  private timers: Map<string, MetricsTimer> = new Map();

  /**
   * Start a new timer
   */
  start(name: string): MetricsTimer {
    if (this.timers.has(name)) {
      console.warn(`Timer "${name}" already exists`);
      return this.timers.get(name)!;
    }

    const timer = new MetricsTimer(name);
    this.timers.set(name, timer);
    return timer;
  }

  /**
   * Stop a timer and get duration
   */
  stop(name: string): number | null {
    const timer = this.timers.get(name);
    if (!timer) {
      console.warn(`Timer "${name}" not found`);
      return null;
    }

    const duration = timer.stop();
    this.timers.delete(name);
    return duration;
  }

  /**
   * Pause a timer
   */
  pause(name: string): void {
    const timer = this.timers.get(name);
    if (timer) {
      timer.pause();
    }
  }

  /**
   * Resume a timer
   */
  resume(name: string): void {
    const timer = this.timers.get(name);
    if (timer) {
      timer.resume();
    }
  }

  /**
   * Get timer
   */
  get(name: string): MetricsTimer | undefined {
    return this.timers.get(name);
  }

  /**
   * Get duration of active timer
   */
  getDuration(name: string): number | null {
    const timer = this.timers.get(name);
    return timer ? timer.getDuration() : null;
  }

  /**
   * Clear all timers
   */
  clear(): void {
    this.timers.clear();
  }

  /**
   * Get all active timers
   */
  getActive(): MetricsTimer[] {
    return Array.from(this.timers.values()).filter(t => t.isRunning());
  }
}

// Export singleton instance
export const timerManager = new TimerManager();


