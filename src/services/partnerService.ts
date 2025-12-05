// === 📁 src/services/partnerService.ts ===
// Service for managing partner/team work

import { db } from './db';
import {
  Employee,
  PartnerSession,
  PartnerFilter,
  PartnerStats,
  SessionStatus,
  WorkType,
} from '@/types/partner';

/**
 * Partner Service
 * Manages employees and partner work sessions
 */
export class PartnerService {
  /**
   * Get all employees
   */
  async getAllEmployees(): Promise<Employee[]> {
    try {
      return await db.employees.toArray();
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }

  /**
   * Get active employees
   */
  async getActiveEmployees(): Promise<Employee[]> {
    try {
      return await db.employees.where('isActive').equals(1).toArray();
    } catch (error) {
      console.error('Error fetching active employees:', error);
      return [];
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployee(id: string): Promise<Employee | undefined> {
    try {
      return await db.employees.get(id);
    } catch (error) {
      console.error('Error fetching employee:', error);
      return undefined;
    }
  }

  /**
   * Filter employees
   */
  async filterEmployees(filter: PartnerFilter): Promise<Employee[]> {
    try {
      let query = db.employees.toCollection();

      // Filter by active status
      if (filter.isActive !== undefined) {
        query = query.filter(emp => emp.isActive === filter.isActive);
      }

      // Filter by role
      if (filter.role) {
        query = query.filter(emp => emp.role === filter.role);
      }

      // Filter by department
      if (filter.department) {
        query = query.filter(emp => emp.department === filter.department);
      }

      let employees = await query.toArray();

      // Search query
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        employees = employees.filter(emp =>
          emp.name.toLowerCase().includes(query) ||
          emp.badge?.toLowerCase().includes(query) ||
          emp.role?.toLowerCase().includes(query)
        );
      }

      return employees;
    } catch (error) {
      console.error('Error filtering employees:', error);
      return [];
    }
  }

  /**
   * Add or update employee
   */
  async saveEmployee(employee: Employee): Promise<void> {
    try {
      await db.employees.put(employee);
    } catch (error) {
      console.error('Error saving employee:', error);
      throw error;
    }
  }

  /**
   * Get current active session for user
   */
  async getCurrentSession(userId: string): Promise<PartnerSession | undefined> {
    try {
      return await db.partnerSessions
        .where('userId')
        .equals(userId)
        .and(session => session.status === 'active' || session.status === 'paused')
        .first();
    } catch (error) {
      console.error('Error fetching current session:', error);
      return undefined;
    }
  }

  /**
   * Start a new partner session
   */
  async startSession(
    userId: string,
    partnerId: string,
    workType?: WorkType,
    documentId?: string
  ): Promise<PartnerSession> {
    try {
      // End any existing active sessions
      const existingSession = await this.getCurrentSession(userId);
      if (existingSession) {
        await this.endSession(existingSession.id);
      }

      const session: PartnerSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        partnerId,
        startedAt: Date.now(),
        status: 'active',
        documentsCompleted: 0,
        linesProcessed: 0,
        itemsProcessed: 0,
        workType,
        documentId,
      };

      await db.partnerSessions.add(session);

      // Update employee's last active time
      await this.updateEmployeeActivity(userId);
      await this.updateEmployeeActivity(partnerId);

      return session;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  /**
   * Update session status
   */
  async updateSessionStatus(
    sessionId: string,
    status: SessionStatus
  ): Promise<void> {
    try {
      await db.partnerSessions.update(sessionId, { status });
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }

  /**
   * Pause session
   */
  async pauseSession(sessionId: string): Promise<void> {
    await this.updateSessionStatus(sessionId, 'paused');
  }

  /**
   * Resume session
   */
  async resumeSession(sessionId: string): Promise<void> {
    await this.updateSessionStatus(sessionId, 'active');
  }

  /**
   * End session
   */
  async endSession(sessionId: string): Promise<void> {
    try {
      await db.partnerSessions.update(sessionId, {
        status: 'completed',
        endedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Cancel session
   */
  async cancelSession(sessionId: string): Promise<void> {
    try {
      await db.partnerSessions.update(sessionId, {
        status: 'cancelled',
        endedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error cancelling session:', error);
      throw error;
    }
  }

  /**
   * Update session statistics
   */
  async updateSessionStats(
    sessionId: string,
    stats: Partial<Pick<PartnerSession, 'documentsCompleted' | 'linesProcessed' | 'itemsProcessed'>>
  ): Promise<void> {
    try {
      await db.partnerSessions.update(sessionId, stats);
    } catch (error) {
      console.error('Error updating session stats:', error);
      throw error;
    }
  }

  /**
   * Get session statistics for a partner
   */
  async getPartnerStats(
    userId: string,
    partnerId: string
  ): Promise<PartnerStats> {
    try {
      const sessions = await db.partnerSessions
        .where('userId')
        .equals(userId)
        .and(session => session.partnerId === partnerId && session.status === 'completed')
        .toArray();

      const partner = await this.getEmployee(partnerId);

      const totalHours = sessions.reduce((sum, session) => {
        if (session.endedAt) {
          return sum + (session.endedAt - session.startedAt) / 3600000; // Convert to hours
        }
        return sum;
      }, 0);

      const documentsCompleted = sessions.reduce(
        (sum, session) => sum + session.documentsCompleted,
        0
      );

      const itemsProcessed = sessions.reduce(
        (sum, session) => sum + session.itemsProcessed,
        0
      );

      const lastSession = sessions.length > 0 
        ? Math.max(...sessions.map(s => s.startedAt))
        : undefined;

      // Calculate compatibility score (simple example - can be more sophisticated)
      const avgDocumentsPerHour = totalHours > 0 ? documentsCompleted / totalHours : 0;
      const compatibility = Math.min(100, Math.round(avgDocumentsPerHour * 10));

      return {
        partnerId,
        partnerName: partner?.name || 'Unknown',
        sessionsCount: sessions.length,
        totalHours: Math.round(totalHours * 10) / 10,
        documentsCompleted,
        itemsProcessed,
        lastSessionAt: lastSession,
        compatibility,
      };
    } catch (error) {
      console.error('Error fetching partner stats:', error);
      return {
        partnerId,
        partnerName: 'Unknown',
        sessionsCount: 0,
        totalHours: 0,
        documentsCompleted: 0,
        itemsProcessed: 0,
        compatibility: 0,
      };
    }
  }

  /**
   * Get recent partners for a user
   */
  async getRecentPartners(userId: string, limit: number = 5): Promise<PartnerStats[]> {
    try {
      const sessions = await db.partnerSessions
        .where('userId')
        .equals(userId)
        .and(session => session.status === 'completed')
        .reverse()
        .sortBy('startedAt');

      // Get unique partner IDs
      const partnerIds = Array.from(new Set(sessions.map(s => s.partnerId)));
      const recentPartnerIds = partnerIds.slice(0, limit);

      // Get stats for each recent partner
      const stats = await Promise.all(
        recentPartnerIds.map(partnerId => this.getPartnerStats(userId, partnerId))
      );

      // Sort by last session date
      return stats.sort((a, b) => {
        if (!a.lastSessionAt) return 1;
        if (!b.lastSessionAt) return -1;
        return b.lastSessionAt - a.lastSessionAt;
      });
    } catch (error) {
      console.error('Error fetching recent partners:', error);
      return [];
    }
  }

  /**
   * Get partner from yesterday's work
   * Returns partner ID if user worked with someone yesterday
   */
  async getYesterdayPartner(userId: string): Promise<string | null> {
    try {
      const now = new Date();
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const yesterdaySessions = await db.partnerSessions
        .where('userId')
        .equals(userId)
        .and(session => 
          session.status === 'completed' && 
          session.startedAt >= yesterdayStart.getTime() && 
          session.startedAt < yesterdayEnd.getTime()
        )
        .toArray();

      if (yesterdaySessions.length === 0) return null;

      // Get the most recent partner from yesterday
      const mostRecentSession = yesterdaySessions.reduce((latest, current) => 
        current.startedAt > latest.startedAt ? current : latest
      );

      return mostRecentSession.partnerId;
    } catch (error) {
      console.error('Error fetching yesterday partner:', error);
      return null;
    }
  }

  /**
   * Update employee's last active time
   */
  private async updateEmployeeActivity(employeeId: string): Promise<void> {
    try {
      await db.employees.update(employeeId, {
        lastActiveAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating employee activity:', error);
    }
  }

  /**
   * Get session duration in minutes
   */
  getSessionDuration(session: PartnerSession): number {
    const endTime = session.endedAt || Date.now();
    return Math.round((endTime - session.startedAt) / 60000);
  }

  /**
   * Format session duration
   */
  formatSessionDuration(session: PartnerSession): string {
    const minutes = this.getSessionDuration(session);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}ч ${mins}мин`;
    }
    return `${mins}мин`;
  }
}

// Export singleton instance
export const partnerService = new PartnerService();

