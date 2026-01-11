// === 📁 src/utils/logger.ts ===
// Safe logging utility that prevents sensitive data exposure in production

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

/**
 * Logger utility for safe logging
 * Prevents sensitive data exposure in production builds
 */
class Logger {
  /**
   * Log debug information (only in development)
   */
  debug(...args: any[]): void {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Log information (only in development)
   */
  log(...args: any[]): void {
    if (isDevelopment) {
      console.log('[LOG]', ...args);
    }
  }

  /**
   * Log warnings (always shown, but sanitized in production)
   */
  warn(...args: any[]): void {
    const sanitized = isProduction ? this.sanitize(args) : args;
    console.warn('[WARN]', ...sanitized);
  }

  /**
   * Log errors (always shown, but sanitized in production)
   */
  error(...args: any[]): void {
    const sanitized = isProduction ? this.sanitize(args) : args;
    console.error('[ERROR]', ...sanitized);
  }

  /**
   * Log info (only in development)
   */
  info(...args: any[]): void {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * Sanitize sensitive data from logs in production
   */
  private sanitize(args: any[]): any[] {
    return args.map(arg => {
      if (typeof arg === 'string') {
        // Remove potential tokens, passwords, etc.
        return arg
          .replace(/token["\s:=]+([a-zA-Z0-9\-_\.]+)/gi, 'token="***"')
          .replace(/password["\s:=]+([^\s"']+)/gi, 'password="***"')
          .replace(/auth["\s:=]+([a-zA-Z0-9\-_\.]+)/gi, 'auth="***"')
          .replace(/bearer\s+([a-zA-Z0-9\-_\.]+)/gi, 'bearer ***');
      }
      if (typeof arg === 'object' && arg !== null) {
        // Recursively sanitize objects
        const sanitized: any = {};
        for (const [key, value] of Object.entries(arg)) {
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes('token') || lowerKey.includes('password') || lowerKey.includes('auth')) {
            sanitized[key] = '***';
          } else if (typeof value === 'object') {
            sanitized[key] = this.sanitize([value])[0];
          } else {
            sanitized[key] = value;
          }
        }
        return sanitized;
      }
      return arg;
    });
  }
}

export const logger = new Logger();

// Export convenience functions
export const log = logger.log.bind(logger);
export const debug = logger.debug.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const info = logger.info.bind(logger);

