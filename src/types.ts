export type Thenable<T> = T | Promise<T>;

export type Dict<T = unknown> = Record<string, T>;

export enum LogLevel {
  Trace,
  Debug,
  Info,
  Warn,
  Error,
  Fatal,
}

export declare interface LogEntry {
  app?: string;
  context: Dict;
  data: Dict;
  level: LogLevel;
  message: string;
  timestamp: number;
}

export declare interface Transport {
  id: string;

  write(entry: LogEntry): Thenable<void>;
}
