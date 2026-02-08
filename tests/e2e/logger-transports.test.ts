import { Logger } from "~/logger";
import { LogLevel, type Transport } from "~/types";

describe("Logger transports integration", () => {
  it("should work without transports", () => {
    const logger = Logger({
      transports: [],
    });

    expect(() => logger.info("test message")).not.toThrow();
  });

  it("should send message to 1 transport", () => {
    const transport: Transport = {
      id: "test-transport",
      write: jest.fn(),
    };
    const logger = Logger({
      transports: [transport],
    });

    logger.info("test message");

    expect(transport.write).toHaveBeenCalledTimes(1);
    const entry = (transport.write as jest.Mock).mock.calls[0][0];
    expect(entry.message).toBe("test message");
    expect(entry.level).toBe(LogLevel.Info);
  });

  it("should send message to multiple transports", () => {
    const transport1: Transport = {
      id: "transport-1",
      write: jest.fn(),
    };
    const transport2: Transport = {
      id: "transport-2",
      write: jest.fn(),
    };
    const logger = Logger({
      transports: [transport1, transport2],
    });

    logger.error("error message");

    expect(transport1.write).toHaveBeenCalledTimes(1);
    expect(transport2.write).toHaveBeenCalledTimes(1);

    const entry1 = (transport1.write as jest.Mock).mock.calls[0][0];
    const entry2 = (transport2.write as jest.Mock).mock.calls[0][0];

    expect(entry1.message).toBe("error message");
    expect(entry1.level).toBe(LogLevel.Error);
    expect(entry2.message).toBe("error message");
    expect(entry2.level).toBe(LogLevel.Error);
  });
});
