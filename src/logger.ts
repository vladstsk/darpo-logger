import { type Dict, type LogEntry, LogLevel, type Transport } from "~/types";

function print(transport: string, error?: unknown): void {
  let message = `Error writing log entry to transport ${transport}`;

  if (error instanceof Error) {
    message += ` ${error.name}: ${error.message}\n${error.stack}\n`;
  } else if (error) {
    message += ` ${error}\n`;
  } else {
    message += "\n";
  }

  process.stderr.write(message);
}

export declare interface Logger {
  trace(message: string, data?: Dict, context?: Dict): void;

  debug(message: string, data?: Dict, context?: Dict): void;

  info(message: string, data?: Dict, context?: Dict): void;

  warn(message: string, data?: Dict, context?: Dict): void;

  error(message: string, data?: Dict, context?: Dict): void;

  fatal(message: string, data?: Dict, context?: Dict): void;
}

type LoggerOptions = {
  app?: string;
  transports: Transport[];
};

export function Logger(options: LoggerOptions): Logger {
  const log = (level: LogLevel, message: string, data?: Dict, context?: Dict) => {
    const entry: LogEntry = {
      app: options.app,
      context: context || {},
      data: data || {},
      level,
      message,
      timestamp: Date.now(),
    };

    for (const transport of options.transports) {
      try {
        const result = transport.write(entry);

        if (result instanceof Promise) {
          result.catch((error) => {
            print(transport.id, error);
          });
        }
      } catch (error) {
        print(transport.id, error);
      }
    }
  };

  return {
    trace(message: string, data?: Dict, context?: Dict): void {
      log(LogLevel.Trace, message, data, context);
    },

    debug(message: string, data?: Dict, context?: Dict): void {
      log(LogLevel.Debug, message, data, context);
    },

    info(message: string, data?: Dict, context?: Dict): void {
      log(LogLevel.Info, message, data, context);
    },

    warn(message: string, data?: Dict, context?: Dict): void {
      log(LogLevel.Warn, message, data, context);
    },

    error(message: string, data?: Dict, context?: Dict): void {
      log(LogLevel.Error, message, data, context);
    },

    fatal(message: string, data?: Dict, context?: Dict): void {
      log(LogLevel.Fatal, message, data, context);
    },
  };
}
