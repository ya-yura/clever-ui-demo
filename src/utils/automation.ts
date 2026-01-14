// === 📁 src/utils/automation.ts ===
// Automation helpers for routine operations

/**
 * Auto-progression: automatically move to next item after scan
 */
export class AutoProgressionService {
  private static enabled = false;
  private static delay = 500; // ms

  static enable(delay: number = 500): void {
    this.enabled = true;
    this.delay = delay;
  }

  static disable(): void {
    this.enabled = false;
  }

  static isEnabled(): boolean {
    return this.enabled;
  }

  static async autoAdvance(callback: () => void): Promise<void> {
    if (!this.enabled) return;

    return new Promise((resolve) => {
      setTimeout(() => {
        callback();
        resolve();
      }, this.delay);
    });
  }
}

/**
 * Auto-correction: detect and fix common quantity mistakes
 */
export class AutoCorrectionService {
  /**
   * Detect if multiple rapid scans of same item should be treated as quantity
   */
  static detectQuantityScans(
    scans: Array<{ barcode: string; timestamp: number }>,
    thresholdMs: number = 2000
  ): { barcode: string; quantity: number } | null {
    if (scans.length < 2) return null;

    // Group consecutive scans of same barcode within threshold
    const grouped: Record<string, number[]> = {};

    scans.forEach((scan, index) => {
      if (index === 0) {
        grouped[scan.barcode] = [scan.timestamp];
        return;
      }

      const prevScan = scans[index - 1];
      const timeDiff = scan.timestamp - prevScan.timestamp;

      if (scan.barcode === prevScan.barcode && timeDiff < thresholdMs) {
        if (!grouped[scan.barcode]) {
          grouped[scan.barcode] = [];
        }
        grouped[scan.barcode].push(scan.timestamp);
      } else {
        grouped[scan.barcode] = [scan.timestamp];
      }
    });

    // Find barcode with most consecutive scans
    let maxBarcode = '';
    let maxCount = 0;

    Object.entries(grouped).forEach(([barcode, timestamps]) => {
      if (timestamps.length > maxCount) {
        maxCount = timestamps.length;
        maxBarcode = barcode;
      }
    });

    if (maxCount >= 2) {
      return { barcode: maxBarcode, quantity: maxCount };
    }

    return null;
  }

  /**
   * Auto-correct quantity based on scan pattern
   */
  static suggestQuantity(
    scans: Array<{ barcode: string; timestamp: number }>,
    currentQuantity: number
  ): number | null {
    const detection = this.detectQuantityScans(scans);
    
    if (detection && detection.quantity !== currentQuantity) {
      return detection.quantity;
    }

    return null;
  }
}

/**
 * Auto-acceptance: automatically accept quantity if operator scanned exact amount
 */
export class AutoAcceptanceService {
  private static enabled = false;
  private static requiresConfirmation = true;

  static enable(requiresConfirmation: boolean = true): void {
    this.enabled = true;
    this.requiresConfirmation = requiresConfirmation;
  }

  static disable(): void {
    this.enabled = false;
  }

  static isEnabled(): boolean {
    return this.enabled;
  }

  static shouldAutoAccept(
    scannedQuantity: number,
    expectedQuantity: number,
    consecutiveScans: number
  ): boolean {
    if (!this.enabled) return false;

    // Auto-accept if scanned exactly the expected quantity
    if (scannedQuantity === expectedQuantity) {
      // If multiple scans of same item, likely intentional
      if (consecutiveScans >= expectedQuantity) {
        return true;
      }
    }

    return false;
  }

  static needsConfirmation(): boolean {
    return this.requiresConfirmation;
  }
}

/**
 * Scan pattern analyzer
 */
export class ScanPatternAnalyzer {
  private scans: Array<{ barcode: string; timestamp: number; lineId: string }> = [];
  private maxHistory = 50;

  /**
   * Record a scan
   */
  addScan(barcode: string, lineId: string): void {
    this.scans.push({
      barcode,
      lineId,
      timestamp: Date.now(),
    });

    // Keep only recent scans
    if (this.scans.length > this.maxHistory) {
      this.scans.shift();
    }
  }

  /**
   * Get scans for a specific line
   */
  getLineScans(lineId: string): Array<{ barcode: string; timestamp: number }> {
    return this.scans
      .filter(s => s.lineId === lineId)
      .map(s => ({ barcode: s.barcode, timestamp: s.timestamp }));
  }

  /**
   * Detect if user is in "rapid scan" mode
   */
  isRapidScanning(): boolean {
    if (this.scans.length < 3) return false;

    const recent = this.scans.slice(-3);
    const timeSpan = recent[recent.length - 1].timestamp - recent[0].timestamp;

    // 3 scans in less than 5 seconds = rapid mode
    return timeSpan < 5000;
  }

  /**
   * Get average scan interval
   */
  getAverageScanInterval(): number {
    if (this.scans.length < 2) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < this.scans.length; i++) {
      intervals.push(this.scans[i].timestamp - this.scans[i - 1].timestamp);
    }

    return intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  }

  /**
   * Predict next expected scan time
   */
  predictNextScanTime(): number {
    const avgInterval = this.getAverageScanInterval();
    const lastScan = this.scans[this.scans.length - 1];
    
    return lastScan ? lastScan.timestamp + avgInterval : Date.now();
  }

  /**
   * Clear history
   */
  clear(): void {
    this.scans = [];
  }
}

/**
 * Smart defaults based on user behavior
 */
export class SmartDefaultsService {
  /**
   * Predict next cell based on pattern
   */
  static predictNextCell(cellHistory: string[]): string | null {
    if (cellHistory.length < 2) return null;

    // Detect sequential pattern (A1-01, A1-02, A1-03...)
    const lastCell = cellHistory[cellHistory.length - 1];
    const match = lastCell.match(/^([A-Z]\d+)-(\d+)$/);
    
    if (match) {
      const [, prefix, num] = match;
      const nextNum = (parseInt(num, 10) + 1).toString().padStart(num.length, '0');
      return `${prefix}-${nextNum}`;
    }

    return null;
  }

  /**
   * Suggest quantity based on typical product handling
   */
  static suggestTypicalQuantity(
    productId: string,
    quantityHistory: Record<string, number[]>
  ): number | null {
    const history = quantityHistory[productId];
    if (!history || history.length < 3) return null;

    // Calculate mode (most common quantity)
    const counts: Record<number, number> = {};
    history.forEach(qty => {
      counts[qty] = (counts[qty] || 0) + 1;
    });

    let maxCount = 0;
    let mode = 0;

    Object.entries(counts).forEach(([qty, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mode = parseInt(qty, 10);
      }
    });

    // Return mode if it appears in >50% of cases
    if (maxCount > history.length / 2) {
      return mode;
    }

    return null;
  }
}

// Global instances
export const scanPatternAnalyzer = new ScanPatternAnalyzer();
export const autoProgression = AutoProgressionService;
export const autoCorrection = AutoCorrectionService;
export const autoAcceptance = AutoAcceptanceService;
export const smartDefaults = SmartDefaultsService;























