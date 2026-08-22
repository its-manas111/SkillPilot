const isDev = typeof import.meta !== 'undefined' ? (import.meta as any).env?.DEV : process.env.NODE_ENV !== 'production';

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) console.debug('[DEBUG]', ...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    if (isDev) console.error('[ERROR]', ...args);
  }
};

export default logger;
