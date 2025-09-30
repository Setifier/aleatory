/**
 * Système de logging centralisé
 * En développement : affiche dans la console
 * En production : peut être étendu pour envoyer vers un service de monitoring
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Interface pour les futures fonctionnalités de monitoring
// interface LogEntry {
//   level: LogLevel;
//   message: string;
//   data?: unknown;
//   timestamp: Date;
// }

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, data?: unknown): void {
    // En développement, afficher dans la console
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

    // En production, on pourrait envoyer vers un service comme Sentry, LogRocket, etc.
    // const entry: LogEntry = { level, message, data, timestamp: new Date() };
    // this.sendToMonitoringService(entry);
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

  // Méthode spéciale pour les erreurs Supabase
  supabaseError(operation: string, error: unknown): void {
    this.error(`Erreur Supabase lors de: ${operation}`, error);
  }

  // Méthode pour logger les actions utilisateur importantes
  userAction(action: string, userId?: string, data?: unknown): void {
    const logData = typeof data === 'object' && data !== null
      ? { userId, ...data }
      : { userId, data };
    this.info(`Action utilisateur: ${action}`, logData);
  }
}

// Instance singleton
export const logger = new Logger();

// Helpers spécifiques
export const logSupabaseError = (operation: string, error: unknown) =>
  logger.supabaseError(operation, error);

export const logUserAction = (action: string, userId?: string, data?: unknown) =>
  logger.userAction(action, userId, data);