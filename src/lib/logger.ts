// Server-only logger - should only be imported in API routes
import 'server-only';

// Simple logger to avoid pino/thread-stream bundling issues
// Matches pino API for compatibility
const isProd = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug');

const levels = ['error', 'warn', 'info', 'debug'] as const;
type LogLevel = (typeof levels)[number];

function shouldLog(level: LogLevel): boolean {
  const levelIndex = levels.indexOf(level);
  const currentLevelIndex = levels.indexOf(logLevel as LogLevel);
  return levelIndex <= currentLevelIndex;
}

function formatMessage(level: string, meta?: Record<string, unknown>, message?: string): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  const msgStr = message ? ` ${message}` : '';
  return `[${timestamp}] ${level.toUpperCase()}:${metaStr}${msgStr}`;
}

export const logger = {
  error: (metaOrMessage: Record<string, unknown> | string, message?: string) => {
    if (shouldLog('error')) {
      if (typeof metaOrMessage === 'string') {
        console.error(formatMessage('error', undefined, metaOrMessage));
      } else {
        console.error(formatMessage('error', metaOrMessage, message));
      }
    }
  },
  warn: (metaOrMessage: Record<string, unknown> | string, message?: string) => {
    if (shouldLog('warn')) {
      if (typeof metaOrMessage === 'string') {
        console.warn(formatMessage('warn', undefined, metaOrMessage));
      } else {
        console.warn(formatMessage('warn', metaOrMessage, message));
      }
    }
  },
  info: (metaOrMessage: Record<string, unknown> | string, message?: string) => {
    if (shouldLog('info')) {
      if (typeof metaOrMessage === 'string') {
        console.info(formatMessage('info', undefined, metaOrMessage));
      } else {
        console.info(formatMessage('info', metaOrMessage, message));
      }
    }
  },
  debug: (metaOrMessage: Record<string, unknown> | string, message?: string) => {
    if (shouldLog('debug')) {
      if (typeof metaOrMessage === 'string') {
        console.debug(formatMessage('debug', undefined, metaOrMessage));
      } else {
        console.debug(formatMessage('debug', metaOrMessage, message));
      }
    }
  },
};
