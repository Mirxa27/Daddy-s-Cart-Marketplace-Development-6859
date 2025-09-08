// Production-ready logging system

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId,
      requestId,
    };
  }

  private log(entry: LogEntry): void {
    if (this.isDevelopment) {
      // Development: Use console with colors
      const colors = {
        info: '\x1b[36m',    // Cyan
        warn: '\x1b[33m',    // Yellow
        error: '\x1b[31m',   // Red
        debug: '\x1b[35m',   // Magenta
      };
      const reset = '\x1b[0m';
      
      console.log(
        `${colors[entry.level]}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`,
        entry.context ? entry.context : ''
      );
    } else if (this.isProduction) {
      // Production: Structured JSON logging
      console.log(JSON.stringify(entry));
      
      // Send to external logging service (e.g., Sentry, LogRocket)
      this.sendToExternalService(entry);
    }
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    try {
      // Send to external logging service
      if (process.env.SENTRY_DSN && entry.level === 'error') {
        // Send errors to Sentry
        // Implementation would go here
      }
      
      // Send to analytics service
      if (process.env.ANALYTICS_API_KEY) {
        // Send to analytics
        // Implementation would go here
      }
    } catch (error) {
      // Fail silently to avoid logging loops
    }
  }

  info(message: string, context?: Record<string, any>, userId?: string, requestId?: string): void {
    const entry = this.createLogEntry('info', message, context, userId, requestId);
    this.log(entry);
  }

  warn(message: string, context?: Record<string, any>, userId?: string, requestId?: string): void {
    const entry = this.createLogEntry('warn', message, context, userId, requestId);
    this.log(entry);
  }

  error(message: string, error?: Error, context?: Record<string, any>, userId?: string, requestId?: string): void {
    const errorContext = {
      ...context,
      ...(error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: this.isDevelopment ? error.stack : undefined,
      }),
    };
    
    const entry = this.createLogEntry('error', message, errorContext, userId, requestId);
    this.log(entry);
  }

  debug(message: string, context?: Record<string, any>, userId?: string, requestId?: string): void {
    if (this.isDevelopment) {
      const entry = this.createLogEntry('debug', message, context, userId, requestId);
      this.log(entry);
    }
  }

  // Specific logging methods for common scenarios
  apiRequest(method: string, path: string, userId?: string, duration?: number): void {
    this.info('API Request', {
      method,
      path,
      duration: duration ? `${duration}ms` : undefined,
    }, userId);
  }

  apiError(method: string, path: string, error: Error, userId?: string): void {
    this.error('API Error', error, {
      method,
      path,
    }, userId);
  }

  userAction(action: string, userId: string, details?: Record<string, any>): void {
    this.info('User Action', {
      action,
      ...details,
    }, userId);
  }

  securityEvent(event: string, details: Record<string, any>, userId?: string): void {
    this.warn('Security Event', {
      event,
      ...details,
    }, userId);
  }

  performance(metric: string, value: number, context?: Record<string, any>): void {
    this.info('Performance Metric', {
      metric,
      value,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logDebug = logger.debug.bind(logger);

// Request logging middleware helper
export function withRequestLogging(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const startTime = Date.now();
    const method = req.method;
    const url = new URL(req.url);
    const path = url.pathname;
    
    try {
      logger.apiRequest(method, path);
      const result = await handler(req, ...args);
      const duration = Date.now() - startTime;
      
      logger.apiRequest(method, path, undefined, duration);
      return result;
    } catch (error) {
      logger.apiError(method, path, error as Error);
      throw error;
    }
  };
}