import { Logger } from "~/logger";
import { type LogEntry, LogLevel, type Transport } from "~/types";

describe("Logger", () => {
  let $write: jest.Mock;
  let $transport: Transport;

  beforeEach(() => {
    $write = jest.fn();
    $transport = {
      id: "mock",
      write: $write,
    };
  });

  describe("LogEntry", () => {
    it("should create LogEntry", () => {
      const logger = Logger({
        transports: [$transport],
      });

      logger.info("test message");

      expect($write).toHaveBeenCalledTimes(1);
      const entry = $write.mock.calls[0][0] as LogEntry;
      expect(entry.level).toBe(LogLevel.Info);
      expect(entry.message).toBe("test message");
      expect(entry.data).toEqual({});
      expect(entry.context).toEqual({});
      expect(entry.timestamp).toBeDefined();
      expect(typeof entry.timestamp).toBe("number");
    });

    it("should create LogEntry with app", () => {
      const logger = Logger({
        app: "test-app",
        transports: [$transport],
      });

      logger.info("test message");

      expect($write).toHaveBeenCalledTimes(1);
      const entry = $write.mock.calls[0][0] as LogEntry;
      expect(entry.app).toBe("test-app");
    });

    it("should create LogEntry with data", () => {
      const logger = Logger({
        transports: [$transport],
      });

      logger.info("test message", { foo: "bar" });

      expect($write).toHaveBeenCalledTimes(1);
      const entry = $write.mock.calls[0][0] as LogEntry;
      expect(entry.data).toEqual({ foo: "bar" });
    });

    it("should create LogEntry with context", () => {
      const logger = Logger({
        transports: [$transport],
      });

      logger.info("test message", undefined, { ctx: "val" });

      expect($write).toHaveBeenCalledTimes(1);
      const entry = $write.mock.calls[0][0] as LogEntry;
      expect(entry.context).toEqual({ ctx: "val" });
    });
  });

  describe("LogLevel", () => {
    it("should handle all log levels", () => {
      const logger = Logger({
        transports: [$transport],
      });

      logger.trace("trace");
      logger.debug("debug");
      logger.info("info");
      logger.warn("warn");
      logger.error("error");
      logger.fatal("fatal");

      expect($write).toHaveBeenCalledTimes(6);
      expect($write.mock.calls[0][0].level).toBe(LogLevel.Trace);
      expect($write.mock.calls[1][0].level).toBe(LogLevel.Debug);
      expect($write.mock.calls[2][0].level).toBe(LogLevel.Info);
      expect($write.mock.calls[3][0].level).toBe(LogLevel.Warn);
      expect($write.mock.calls[4][0].level).toBe(LogLevel.Error);
      expect($write.mock.calls[5][0].level).toBe(LogLevel.Fatal);
    });

    it("should preserve message for each level", () => {
      const logger = Logger({
        transports: [$transport],
      });

      logger.trace("trace msg");
      logger.debug("debug msg");
      logger.info("info msg");
      logger.warn("warn msg");
      logger.error("error msg");
      logger.fatal("fatal msg");

      expect($write.mock.calls[0][0].message).toBe("trace msg");
      expect($write.mock.calls[1][0].message).toBe("debug msg");
      expect($write.mock.calls[2][0].message).toBe("info msg");
      expect($write.mock.calls[3][0].message).toBe("warn msg");
      expect($write.mock.calls[4][0].message).toBe("error msg");
      expect($write.mock.calls[5][0].message).toBe("fatal msg");
    });
  });

  describe("Transport", () => {
    it("should handle multiple transports", () => {
      const _write = jest.fn();
      const _transport = { id: "mock2", write: _write };

      const logger = Logger({
        transports: [$transport, _transport],
      });

      logger.debug("multi");

      expect($write).toHaveBeenCalledTimes(1);
      expect(_write).toHaveBeenCalledTimes(1);
    });

    it("should handle undefined transport errors", () => {
      const spy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);

      $write.mockImplementation(() => {
        throw undefined;
      });

      const logger = Logger({
        transports: [$transport],
      });

      logger.info("test");

      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0]?.[0]).toBe("Error writing log entry to transport mock\n");

      spy.mockRestore();
    });

    it("should handle async transport that resolves", async () => {
      $write.mockReturnValue(Promise.resolve());

      const logger = Logger({
        transports: [$transport],
      });

      logger.info("test");

      expect($write).toHaveBeenCalledTimes(1);

      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    it("should handle mixed sync and async transports", async () => {
      const _write = jest.fn().mockReturnValue(Promise.resolve());
      const _transport: Transport = { id: "mock2", write: _write };

      const logger = Logger({
        transports: [$transport, _transport],
      });

      logger.info("test");

      expect($write).toHaveBeenCalledTimes(1);
      expect(_write).toHaveBeenCalledTimes(1);

      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  });

  describe("Error", () => {
    it("should handle transport errors and print to stderr", () => {
      const stderr = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
      const error = new Error("transport error");

      $write.mockImplementation(() => {
        throw error;
      });

      const logger = Logger({ transports: [$transport] });

      logger.info("test");

      expect(stderr).toHaveBeenCalled();
      expect(stderr.mock.calls[0]?.[0]).toContain("Error writing log entry to transport mock");
      expect(stderr.mock.calls[0]?.[0]).toContain("transport error");

      stderr.mockRestore();
    });

    it("should handle async transport errors", async () => {
      const stderr = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
      const error = new Error("async error");

      $write.mockReturnValue(Promise.reject(error));

      const logger = Logger({
        transports: [$transport],
      });

      logger.info("test");

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(stderr).toHaveBeenCalled();
      expect(stderr.mock.calls[0]?.[0]).toContain("async error");

      stderr.mockRestore();
    });

    it("should handle non-Error transport errors", () => {
      const stderr = jest.spyOn(process.stderr, "write").mockImplementation(() => true);

      $write.mockImplementation(() => {
        throw "string error";
      });

      const logger = Logger({
        transports: [$transport],
      });

      logger.info("test");

      expect(stderr).toHaveBeenCalled();
      expect(stderr.mock.calls[0]?.[0]).toContain("string error");

      stderr.mockRestore();
    });
  });
});
