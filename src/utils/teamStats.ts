// === 📁 src/utils/teamStats.ts ===
// Team statistics collection and analysis

interface OperationStat {
  id: string;
  userId: string;
  partnerId?: string;
  operationType: string;
  documentId: string;
  startTime: number;
  endTime: number;
  duration: number; // milliseconds
  itemsProcessed: number;
  errorsCount: number;
  timestamp: number;
}

interface UserStats {
  userId: string;
  totalOperations: number;
  totalDuration: number;
  totalItems: number;
  totalErrors: number;
  averageTime: number; // minutes per operation
  errorRate: number; // percentage
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

const STATS_STORAGE_KEY = 'teamOperationStats';
const USER_STATS_KEY = 'userStatsSummary';

/**
 * Team Statistics Manager
 */
export class TeamStatsManager {
  private static instance: TeamStatsManager;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): TeamStatsManager {
    if (!TeamStatsManager.instance) {
      TeamStatsManager.instance = new TeamStatsManager();
    }
    return TeamStatsManager.instance;
  }

  /**
   * Record an operation completion
   */
  async recordOperation(operation: Omit<OperationStat, 'id' | 'timestamp'>): Promise<void> {
    const stat: OperationStat = {
      ...operation,
      id: `stat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    try {
      // Get existing stats
      const stats = this.getStoredStats();
      stats.push(stat);

      // Keep only last 1000 operations per user to avoid storage bloat
      const limitedStats = this.limitStatsPerUser(stats, 1000);

      // Save to localStorage
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(limitedStats));

      // Update user summary
      await this.updateUserStats(stat.userId);

      console.log('✓ Operation stats recorded:', stat);
    } catch (error) {
      console.error('❌ Failed to record operation stats:', error);
    }
  }

  /**
   * Get stored operation stats
   */
  private getStoredStats(): OperationStat[] {
    try {
      const stored = localStorage.getItem(STATS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load stats:', error);
      return [];
    }
  }

  /**
   * Limit stats per user to prevent storage bloat
   */
  private limitStatsPerUser(stats: OperationStat[], limit: number): OperationStat[] {
    const statsByUser = new Map<string, OperationStat[]>();

    // Group by user
    stats.forEach(stat => {
      const userStats = statsByUser.get(stat.userId) || [];
      userStats.push(stat);
      statsByUser.set(stat.userId, userStats);
    });

    // Limit each user and flatten
    const limitedStats: OperationStat[] = [];
    statsByUser.forEach(userStats => {
      // Sort by timestamp descending and take latest N
      const sorted = userStats.sort((a, b) => b.timestamp - a.timestamp);
      limitedStats.push(...sorted.slice(0, limit));
    });

    return limitedStats;
  }

  /**
   * Update user statistics summary
   */
  private async updateUserStats(userId: string): Promise<void> {
    const stats = this.getStoredStats().filter(s => s.userId === userId);

    // Calculate last 30 days stats
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentStats = stats.filter(s => s.timestamp >= thirtyDaysAgo);

    if (recentStats.length === 0) return;

    const totalDuration = recentStats.reduce((sum, s) => sum + s.duration, 0);
    const totalItems = recentStats.reduce((sum, s) => sum + s.itemsProcessed, 0);
    const totalErrors = recentStats.reduce((sum, s) => sum + s.errorsCount, 0);

    const userStats: UserStats = {
      userId,
      totalOperations: recentStats.length,
      totalDuration,
      totalItems,
      totalErrors,
      averageTime: Math.round(totalDuration / recentStats.length / 60000), // minutes
      errorRate: totalItems > 0 ? Math.round((totalErrors / totalItems) * 100) : 0,
      trend: this.calculateTrend(recentStats),
      lastUpdated: Date.now(),
    };

    // Save summary
    const summaries = this.getUserStatsSummaries();
    summaries.set(userId, userStats);
    
    const summaryArray = Array.from(summaries.values());
    localStorage.setItem(USER_STATS_KEY, JSON.stringify(summaryArray));
  }

  /**
   * Calculate performance trend
   */
  private calculateTrend(stats: OperationStat[]): 'up' | 'down' | 'stable' {
    if (stats.length < 10) return 'stable';

    // Sort by timestamp
    const sorted = [...stats].sort((a, b) => a.timestamp - b.timestamp);

    // Split into first half and second half
    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);

    // Calculate average error rate for each half
    const firstHalfErrorRate = this.calculateErrorRate(firstHalf);
    const secondHalfErrorRate = this.calculateErrorRate(secondHalf);

    // Compare
    const difference = secondHalfErrorRate - firstHalfErrorRate;
    
    if (difference < -1) return 'up'; // Error rate decreased = performance up
    if (difference > 1) return 'down'; // Error rate increased = performance down
    return 'stable';
  }

  /**
   * Calculate error rate for a set of operations
   */
  private calculateErrorRate(stats: OperationStat[]): number {
    const totalItems = stats.reduce((sum, s) => sum + s.itemsProcessed, 0);
    const totalErrors = stats.reduce((sum, s) => sum + s.errorsCount, 0);
    return totalItems > 0 ? (totalErrors / totalItems) * 100 : 0;
  }

  /**
   * Get user statistics summaries
   */
  private getUserStatsSummaries(): Map<string, UserStats> {
    try {
      const stored = localStorage.getItem(USER_STATS_KEY);
      if (!stored) return new Map();

      const array = JSON.parse(stored) as UserStats[];
      return new Map(array.map(stat => [stat.userId, stat]));
    } catch (error) {
      console.error('Failed to load user stats:', error);
      return new Map();
    }
  }

  /**
   * Get statistics for a specific user
   */
  getUserStats(userId: string): UserStats | null {
    const summaries = this.getUserStatsSummaries();
    return summaries.get(userId) || null;
  }

  /**
   * Get statistics for all users
   */
  getAllUserStats(): UserStats[] {
    const summaries = this.getUserStatsSummaries();
    return Array.from(summaries.values());
  }

  /**
   * Get team comparison data
   */
  getTeamComparison(): {
    topPerformers: UserStats[];
    needsImprovement: UserStats[];
    averageTime: number;
    averageErrorRate: number;
  } {
    const allStats = this.getAllUserStats();

    if (allStats.length === 0) {
      return {
        topPerformers: [],
        needsImprovement: [],
        averageTime: 0,
        averageErrorRate: 0,
      };
    }

    // Sort by error rate (lower is better)
    const sorted = [...allStats].sort((a, b) => a.errorRate - b.errorRate);

    // Calculate averages
    const totalTime = allStats.reduce((sum, s) => sum + s.averageTime, 0);
    const totalErrorRate = allStats.reduce((sum, s) => sum + s.errorRate, 0);

    return {
      topPerformers: sorted.slice(0, 5),
      needsImprovement: sorted.slice(-5).reverse(),
      averageTime: Math.round(totalTime / allStats.length),
      averageErrorRate: Math.round((totalErrorRate / allStats.length) * 10) / 10,
    };
  }

  /**
   * Get partner pair statistics
   */
  getPartnerPairStats(userId1: string, userId2: string): {
    operationsTogether: number;
    averageTime: number;
    errorRate: number;
  } {
    const stats = this.getStoredStats().filter(
      s => (s.userId === userId1 && s.partnerId === userId2) ||
           (s.userId === userId2 && s.partnerId === userId1)
    );

    if (stats.length === 0) {
      return {
        operationsTogether: 0,
        averageTime: 0,
        errorRate: 0,
      };
    }

    const totalDuration = stats.reduce((sum, s) => sum + s.duration, 0);
    const totalItems = stats.reduce((sum, s) => sum + s.itemsProcessed, 0);
    const totalErrors = stats.reduce((sum, s) => sum + s.errorsCount, 0);

    return {
      operationsTogether: stats.length,
      averageTime: Math.round(totalDuration / stats.length / 60000),
      errorRate: totalItems > 0 ? Math.round((totalErrors / totalItems) * 100) : 0,
    };
  }

  /**
   * Clear old statistics (older than 90 days)
   */
  clearOldStats(): void {
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    const stats = this.getStoredStats().filter(s => s.timestamp >= ninetyDaysAgo);
    
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    console.log(`✓ Cleared old stats. Remaining: ${stats.length}`);
  }

  /**
   * Export statistics for analysis
   */
  exportStats(): string {
    const stats = this.getStoredStats();
    return JSON.stringify(stats, null, 2);
  }
}

// Export singleton instance
export const teamStats = TeamStatsManager.getInstance();


