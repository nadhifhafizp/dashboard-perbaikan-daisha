/**
 * lib/logger.ts - Structured Server Logger (WS8.F8.1 & F8.2)
 * 
 * Logging terstruktur dengan level (INFO, WARN, ERROR), timestamp ISO,
 * tracing requestId, dan konteks modul/metadata.
 */

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogContext {
  requestId?: string;
  module?: string;
  user?: string;
  role?: string;
  durationMs?: number;
  [key: string]: unknown;
}

class Logger {
  private format(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const reqId = context?.requestId ? `[${context.requestId}]` : '';
    const mod = context?.module ? `[${context.module}]` : '';
    const meta = context && Object.keys(context).length > 0
      ? ` | ${JSON.stringify(context)}`
      : '';

    return `[${timestamp}] [${level}] ${reqId} ${mod} ${message}${meta}`;
  }

  info(message: string, context?: LogContext): void {
    console.info(this.format('INFO', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.format('WARN', message, context));
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const errObj = error instanceof Error
      ? { errorMessage: error.message, stack: error.stack }
      : { rawError: error };

    console.error(
      this.format('ERROR', message, {
        ...context,
        ...errObj,
      })
    );
  }

  slow(handlerName: string, durationMs: number, thresholdMs = 500, context?: LogContext): void {
    if (durationMs >= thresholdMs) {
      this.warn(
        `Slow execution detected in ${handlerName}: took ${durationMs}ms (threshold: ${thresholdMs}ms)`,
        { ...context, durationMs }
      );
    }
  }
}

export const logger = new Logger();
export default logger;
