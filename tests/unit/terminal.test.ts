import { TerminalTransport } from "~/transports/terminal";
import { type LogEntry, LogLevel } from "~/types";

describe("TerminalTransport", () => {
  let $stdout: jest.SpyInstance;
  let $stderr: jest.SpyInstance;

  beforeEach(() => {
    $stdout = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    $stderr = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    $stdout.mockRestore();
    $stderr.mockRestore();
  });

  const createEntry = (level: LogLevel, message: string, data = {}, context = {}, app?: string): LogEntry => ({
    level,
    message,
    timestamp: Date.now(),
    data,
    context,
    app,
  });

  describe("Level filtering", () => {
    it("should write when level is included", () => {
      const transport = TerminalTransport(LogLevel.Info);
      const entry = createEntry(LogLevel.Info, "info message");

      transport.write(entry);

      expect($stdout).toHaveBeenCalledTimes(1);
    });

    it("should not write when level is not included", () => {
      const transport = TerminalTransport(LogLevel.Error);
      const entry = createEntry(LogLevel.Info, "info message");

      transport.write(entry);

      expect($stdout).not.toHaveBeenCalled();
      expect($stderr).not.toHaveBeenCalled();
    });

    it("should accept array of levels", () => {
      const transport = TerminalTransport([LogLevel.Info, LogLevel.Warn]);

      transport.write(createEntry(LogLevel.Info, "info"));
      transport.write(createEntry(LogLevel.Warn, "warn"));
      transport.write(createEntry(LogLevel.Error, "error"));

      expect($stdout).toHaveBeenCalledTimes(2);
      expect($stderr).not.toHaveBeenCalled();
    });

    it("should accept single level", () => {
      const transport = TerminalTransport(LogLevel.Info);

      transport.write(createEntry(LogLevel.Info, "info"));
      transport.write(createEntry(LogLevel.Warn, "warn"));

      expect($stdout).toHaveBeenCalledTimes(1);
    });

    it("should handle undefined level filter (no filtering)", () => {
      const transport = TerminalTransport();

      transport.write(createEntry(LogLevel.Trace, "trace"));
      transport.write(createEntry(LogLevel.Debug, "debug"));
      transport.write(createEntry(LogLevel.Info, "info"));
      transport.write(createEntry(LogLevel.Warn, "warn"));
      transport.write(createEntry(LogLevel.Error, "error"));
      transport.write(createEntry(LogLevel.Fatal, "fatal"));

      expect($stdout).toHaveBeenCalledTimes(4);
      expect($stderr).toHaveBeenCalledTimes(2);
    });
  });

  describe("Output streams", () => {
    it("should write Info to stdout", () => {
      const transport = TerminalTransport(LogLevel.Info);
      const entry = createEntry(LogLevel.Info, "info message");

      transport.write(entry);

      expect($stdout).toHaveBeenCalled();
      expect($stderr).not.toHaveBeenCalled();
    });

    it("should write Error to stderr", () => {
      const transport = TerminalTransport(LogLevel.Error);
      const entry = createEntry(LogLevel.Error, "error message");

      transport.write(entry);

      expect($stderr).toHaveBeenCalled();
      expect($stdout).not.toHaveBeenCalled();
    });

    it("should write Fatal to stderr", () => {
      const transport = TerminalTransport(LogLevel.Fatal);
      const entry = createEntry(LogLevel.Fatal, "fatal message");

      transport.write(entry);

      expect($stderr).toHaveBeenCalled();
      expect($stdout).not.toHaveBeenCalled();
    });

    it("should write Trace to stdout", () => {
      const transport = TerminalTransport(LogLevel.Trace);
      const entry = createEntry(LogLevel.Trace, "trace message");

      transport.write(entry);

      expect($stdout).toHaveBeenCalled();
      expect($stderr).not.toHaveBeenCalled();
    });

    it("should write Debug to stdout", () => {
      const transport = TerminalTransport(LogLevel.Debug);
      const entry = createEntry(LogLevel.Debug, "debug message");

      transport.write(entry);

      expect($stdout).toHaveBeenCalled();
      expect($stderr).not.toHaveBeenCalled();
    });

    it("should write Warn to stdout", () => {
      const transport = TerminalTransport(LogLevel.Warn);
      const entry = createEntry(LogLevel.Warn, "warn message");

      transport.write(entry);

      expect($stdout).toHaveBeenCalled();
      expect($stderr).not.toHaveBeenCalled();
    });
  });

  describe("Transport interface", () => {
    it("should have id property", () => {
      const transport = TerminalTransport(LogLevel.Info);

      expect(transport.id).toBe("terminal");
    });

    it("should have write method", () => {
      const transport = TerminalTransport(LogLevel.Info);

      expect(typeof transport.write).toBe("function");
    });

    it("should return void from write", () => {
      const transport = TerminalTransport(LogLevel.Info);
      const entry = createEntry(LogLevel.Info, "test");

      const result = transport.write(entry);

      expect(result).toBeUndefined();
    });
  });
});
