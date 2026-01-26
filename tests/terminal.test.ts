import { TerminalTransport } from "~/transports/terminal";
import { type LogEntry, LogLevel } from "~/types";

describe("TerminalTransport", () => {
  let stdout: jest.SpyInstance;
  let stderr: jest.SpyInstance;

  beforeEach(() => {
    stdout = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    stderr = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdout.mockRestore();
    stderr.mockRestore();
  });

  it("should write Info to stdout if level is included", () => {
    const transport = TerminalTransport(LogLevel.Info);
    const entry: LogEntry = {
      level: LogLevel.Info,
      message: "info message",
      timestamp: Date.now(),
      data: {},
      context: {},
    };

    transport.write(entry);

    expect(stdout).toHaveBeenCalled();
    expect(stdout.mock.calls[0][0]).toContain("info message");
    expect(stderr).not.toHaveBeenCalled();
  });

  it("should write Error to stderr if level is included", () => {
    const transport = TerminalTransport([LogLevel.Error]);
    const entry: LogEntry = {
      level: LogLevel.Error,
      message: "error message",
      timestamp: Date.now(),
      data: {},
      context: {},
    };

    transport.write(entry);

    expect(stderr).toHaveBeenCalled();
    expect(stderr.mock.calls[0][0]).toContain("error message");
    expect(stdout).not.toHaveBeenCalled();
  });

  it("should not write if level is not included", () => {
    const transport = TerminalTransport(LogLevel.Error);
    const entry: LogEntry = {
      level: LogLevel.Info,
      message: "info message",
      timestamp: Date.now(),
      data: {},
      context: {},
    };

    transport.write(entry);

    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).not.toHaveBeenCalled();
  });

  it("should handle multiple levels", () => {
    const transport = TerminalTransport([LogLevel.Info, LogLevel.Warn]);

    transport.write({
      level: LogLevel.Info,
      message: "info",
      timestamp: Date.now(),
      data: {},
      context: {},
    });

    transport.write({
      level: LogLevel.Warn,
      message: "warn",
      timestamp: Date.now(),
      data: {},
      context: {},
    });

    expect(stdout).toHaveBeenCalledTimes(2);
  });
});
