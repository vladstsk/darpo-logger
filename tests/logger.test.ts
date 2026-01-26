import { Logger } from "~/logger";
import { type LogEntry, LogLevel, type Transport } from "~/types";

describe("Logger", () => {
  let mockTransport: Transport;
  let writeSpy: jest.Mock;

  beforeEach(() => {
    writeSpy = jest.fn();
    mockTransport = {
      id: "mock",
      write: writeSpy,
    };
  });

  it("should write to transport with correct entry", () => {
    const logger = Logger({
      app: "test-app",
      transports: [mockTransport],
    });

    logger.info("test message", { foo: "bar" }, { ctx: "val" });

    expect(writeSpy).toHaveBeenCalledTimes(1);
    const entry = writeSpy.mock.calls[0][0] as LogEntry;
    expect(entry.app).toBe("test-app");
    expect(entry.level).toBe(LogLevel.Info);
    expect(entry.message).toBe("test message");
    expect(entry.data).toEqual({ foo: "bar" });
    expect(entry.context).toEqual({ ctx: "val" });
    expect(entry.timestamp).toBeDefined();
  });

  it("should handle multiple transports", () => {
    const writeSpy2 = jest.fn();
    const mockTransport2 = { id: "mock2", write: writeSpy2 };
    const logger = Logger({
      transports: [mockTransport, mockTransport2],
    });

    logger.debug("multi");

    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(writeSpy2).toHaveBeenCalledTimes(1);
  });

  it("should handle all log levels", () => {
    const logger = Logger({ transports: [mockTransport] });

    logger.trace("trace");
    logger.debug("debug");
    logger.info("info");
    logger.warn("warn");
    logger.error("error");
    logger.fatal("fatal");

    expect(writeSpy).toHaveBeenCalledTimes(6);
    expect(writeSpy.mock.calls[0][0].level).toBe(LogLevel.Trace);
    expect(writeSpy.mock.calls[1][0].level).toBe(LogLevel.Debug);
    expect(writeSpy.mock.calls[2][0].level).toBe(LogLevel.Info);
    expect(writeSpy.mock.calls[3][0].level).toBe(LogLevel.Warn);
    expect(writeSpy.mock.calls[4][0].level).toBe(LogLevel.Error);
    expect(writeSpy.mock.calls[5][0].level).toBe(LogLevel.Fatal);
  });

  it("should handle transport errors and print to stderr", () => {
    const stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
    const error = new Error("transport error");
    writeSpy.mockImplementation(() => {
      throw error;
    });

    const logger = Logger({ transports: [mockTransport] });
    logger.info("test");

    expect(stderrSpy).toHaveBeenCalled();
    expect(stderrSpy.mock.calls[0]?.[0]).toContain("Error writing log entry to transport mock");
    expect(stderrSpy.mock.calls[0]?.[0]).toContain("transport error");

    stderrSpy.mockRestore();
  });

  it("should handle async transport errors", async () => {
    const stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
    const error = new Error("async error");
    writeSpy.mockReturnValue(Promise.reject(error));

    const logger = Logger({ transports: [mockTransport] });
    logger.info("test");

    // Need to wait for promise rejection to be handled
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(stderrSpy).toHaveBeenCalled();
    expect(stderrSpy.mock.calls[0]?.[0]).toContain("async error");

    stderrSpy.mockRestore();
  });

  it("should handle non-Error transport errors", () => {
    const stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
    writeSpy.mockImplementation(() => {
      throw "string error";
    });

    const logger = Logger({ transports: [mockTransport] });
    logger.info("test");

    expect(stderrSpy).toHaveBeenCalled();
    expect(stderrSpy.mock.calls[0]?.[0]).toContain("string error");

    stderrSpy.mockRestore();
  });

  it("should handle undefined transport errors", () => {
    const stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
    writeSpy.mockImplementation(() => {
      throw undefined;
    });

    const logger = Logger({ transports: [mockTransport] });
    logger.info("test");

    expect(stderrSpy).toHaveBeenCalled();
    expect(stderrSpy.mock.calls[0]?.[0]).toBe("Error writing log entry to transport mock\n");

    stderrSpy.mockRestore();
  });
});
