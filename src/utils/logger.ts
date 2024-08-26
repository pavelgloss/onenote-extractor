import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private level: LogLevel;
  private logFilePath: string;

  constructor(level: LogLevel = LogLevel.INFO, logFilePath: string = 'app.log') {
    this.level = level;
    this.logFilePath = path.resolve(logFilePath);
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (level >= this.level) {
      const timestamp = new Date().toISOString();
      const levelString = LogLevel[level];
      const formattedMessage = `[${timestamp}] ${levelString}: ${message} ${args.join(' ')}`;

      // Log to console
      console.log(formattedMessage);

      // Log to file
      fs.appendFileSync(this.logFilePath, formattedMessage + '\n');

      // duplicate log into error.log file if level is WARN or ERROR
      if (level >= LogLevel.WARN) {
        fs.appendFileSync('error.log', formattedMessage + '\n');
      }
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


export const logger: Logger = new Logger(LogLevel.INFO);