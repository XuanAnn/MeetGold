type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  debug(...args: any[]) {
    console.debug(`%c[${this.prefix}]`, 'color: #9ca3af; font-weight: bold;', ...args);
  }

  info(...args: any[]) {
    console.info(`%c[${this.prefix}]`, 'color: #38bdf8; font-weight: bold;', ...args);
  }

  warn(...args: any[]) {
    console.warn(`%c[${this.prefix}]`, 'color: #facc15; font-weight: bold;', ...args);
  }

  error(...args: any[]) {
    console.error(`%c[${this.prefix}]`, 'color: #f87171; font-weight: bold;', ...args);
  }

  network(event: string, details?: any) {
    console.log(
      `%c[${this.prefix}:NETWORK] %c${event}`,
      'color: #a855f7; font-weight: bold;',
      'color: #34d399; font-weight: 600;',
      details || ''
    );
  }
}

export function createLogger(prefix: string): Logger {
  return new Logger(prefix);
}
