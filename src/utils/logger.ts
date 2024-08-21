export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
  }
  
  export class Logger {
    private level: LogLevel;
  
    constructor(level: LogLevel = LogLevel.INFO) {
      this.level = level;
    }
  
    private log(level: LogLevel, message: string, ...args: any[]): void {
      if (level >= this.level) {
        const timestamp = new Date().toISOString();
        const levelString = LogLevel[level];
        console.log(`[${timestamp}] ${levelString}: ${message}`, ...args);
      }
    }
  
    debug(message: string, ...args: any[]): void {
      this.log(LogLevel.DEBUG, message, ...args);
    }
  
    info(message: string, ...args: any[]): void {
      this.log(LogLevel.INFO, message, ...args);
    }
  
    warn(message: string, ...args: any[]): void {
      this.log(LogLevel.WARN, message, ...args);
    }
  
    error(message: string, ...args: any[]): void {
      this.log(LogLevel.ERROR, message, ...args);
    }
  
    setLevel(level: LogLevel): void {
      this.level = level;
    }
  }
  
  export function createLogger(level: LogLevel = LogLevel.INFO): Logger {
    return new Logger(level);
  }