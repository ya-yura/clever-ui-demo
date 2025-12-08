// === 📁 src/metrics/session.ts ===
// Session management for metrics

interface SessionData {
  id: string;
  userId: string;
  partnerId?: string;
  startTime: number;
  endTime?: number;
  operationsCount: number;
  documentsProcessed: string[];
  active: boolean;
}

const SESSION_STORAGE_KEY = 'metricsSession';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity

/**
 * Session manager for tracking user work sessions
 */
export class SessionManager {
  private static instance: SessionManager;
  private currentSession: SessionData | null = null;
  private activityTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadSession();
    this.startActivityMonitor();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Start a new session
   */
  startSession(userId: string, partnerId?: string): string {
    // End previous session if exists
    if (this.currentSession) {
      this.endSession();
    }

    this.currentSession = {
      id: this.generateSessionId(),
      userId,
      partnerId,
      startTime: Date.now(),
      operationsCount: 0,
      documentsProcessed: [],
      active: true,
    };

    this.saveSession();
    return this.currentSession.id;
  }

  /**
   * End current session
   */
  endSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.active = false;

    // Save final state
    this.saveSession();

    // Archive session (could save to IndexedDB for history)
    this.archiveSession(this.currentSession);

    // Clear current
    this.currentSession = null;
    this.clearSessionStorage();
  }

  /**
   * Get current session
   */
  getCurrentSession(): SessionData | null {
    // Check if session is still active
    if (this.currentSession && this.isSessionExpired()) {
      this.endSession();
      return null;
    }

    return this.currentSession;
  }

  /**
   * Update session activity
   */
  recordActivity(documentId?: string): void {
    if (!this.currentSession) return;

    this.currentSession.operationsCount++;
    
    if (documentId && !this.currentSession.documentsProcessed.includes(documentId)) {
      this.currentSession.documentsProcessed.push(documentId);
    }

    this.saveSession();
    this.resetActivityTimer();
  }

  /**
   * Get session duration in milliseconds
   */
  getSessionDuration(): number {
    if (!this.currentSession) return 0;

    const end = this.currentSession.endTime || Date.now();
    return end - this.currentSession.startTime;
  }

  /**
   * Update partner in current session
   */
  updatePartner(partnerId: string): void {
    if (!this.currentSession) return;

    this.currentSession.partnerId = partnerId;
    this.saveSession();
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    duration: number;
    operationsCount: number;
    documentsCount: number;
    averageTimePerDocument: number;
  } | null {
    if (!this.currentSession) return null;

    const duration = this.getSessionDuration();
    const documentsCount = this.currentSession.documentsProcessed.length;
    const averageTimePerDocument = documentsCount > 0 
      ? duration / documentsCount 
      : 0;

    return {
      duration,
      operationsCount: this.currentSession.operationsCount,
      documentsCount,
      averageTimePerDocument,
    };
  }

  // Private methods

  private loadSession(): void {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored) as SessionData;
        
        // Check if session is still valid
        if (session.active && !this.isSessionExpired(session)) {
          this.currentSession = session;
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }

  private saveSession(): void {
    if (!this.currentSession) return;

    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  private clearSessionStorage(): void {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session storage:', error);
    }
  }

  private isSessionExpired(session?: SessionData): boolean {
    const s = session || this.currentSession;
    if (!s) return true;

    const now = Date.now();
    const lastActivity = s.endTime || now;
    return (now - lastActivity) > SESSION_TIMEOUT;
  }

  private startActivityMonitor(): void {
    // Listen for user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, () => {
        this.recordActivity();
      }, { passive: true });
    });
  }

  private resetActivityTimer(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }

    // Auto-end session after timeout
    this.activityTimer = setTimeout(() => {
      if (this.currentSession) {
        console.log('Session timed out due to inactivity');
        this.endSession();
      }
    }, SESSION_TIMEOUT);
  }

  private archiveSession(session: SessionData): void {
    try {
      const archived = localStorage.getItem('archivedSessions');
      const sessions = archived ? JSON.parse(archived) : [];
      
      sessions.push(session);
      
      // Keep only last 50 sessions
      if (sessions.length > 50) {
        sessions.shift();
      }
      
      localStorage.setItem('archivedSessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to archive session:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get archived sessions
   */
  getArchivedSessions(): SessionData[] {
    try {
      const archived = localStorage.getItem('archivedSessions');
      return archived ? JSON.parse(archived) : [];
    } catch (error) {
      console.error('Failed to load archived sessions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();


