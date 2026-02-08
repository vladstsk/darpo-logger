import { formatWithOptions } from "node:util";
import { type LogEntry, LogLevel, type Transport } from "~/types";

const COLORS = {
  [LogLevel.Trace]: "\x1b[90m",
  [LogLevel.Debug]: "\x1b[36m",
  [LogLevel.Info]: "\x1b[32m",
  [LogLevel.Warn]: "\x1b[33m",
  [LogLevel.Error]: "\x1b[31m",
  [LogLevel.Fatal]: "\x1b[41m",
};

export function TerminalTransport(level?: LogLevel | LogLevel[]): Transport {
  const levels = Array.isArray(level) ? level : [level];

  return {
    id: "terminal",

    write(entry: LogEntry) {
      if (level !== undefined && !levels.includes(entry.level)) {
        return;
      }

      process[entry.level === LogLevel.Error || entry.level === LogLevel.Fatal ? "stderr" : "stdout"].write(
        formatWithOptions(
          { colors: true },
          `%s ${COLORS[entry.level]}[%s] %s\x1b[0m`,
          new Date(entry.timestamp),
          LogLevel[entry.level].toUpperCase(),
          entry.message,
          entry.data,
          entry.context,
          "\n"
        )
      );
    },
  };
}
