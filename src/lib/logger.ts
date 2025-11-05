import * as Sentry from "@sentry/react";

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? console.error :
                           level === 'warn' ? console.warn :
                           level === 'debug' ? console.debug :
                           console.log;

      if (data !== undefined) {
        consoleMethod(`[${level.toUpperCase()}] ${message}`, data);
      } else {
        consoleMethod(`[${level.toUpperCase()}] ${message}`);
      }
    }

    if (!this.isDevelopment) {
      if (level === 'error') {
        Sentry.captureException(data instanceof Error ? data : new Error(message), {
          level: 'error',
          extra: { originalMessage: message, data }
        });
      } else if (level === 'warn') {
        Sentry.captureMessage(message, {
          level: 'warning',
          extra: { data }
        });
      }
    }
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  supabaseError(operation: string, error: unknown): void {
    this.error(`Erreur Supabase lors de: ${operation}`, error);
  }

  userAction(action: string, userId?: string, data?: unknown): void {
    const logData = typeof data === 'object' && data !== null
      ? { userId, ...data }
      : { userId, data };
    this.info(`Action utilisateur: ${action}`, logData);
  }
}

export const logger = new Logger();

export const logSupabaseError = (operation: string, error: unknown) =>
  logger.supabaseError(operation, error);

export const logUserAction = (action: string, userId?: string, data?: unknown) =>
  logger.userAction(action, userId, data);