/**
 * Unit Tests for Logger
 * Target Coverage: 70%
 */

const logger = require("../../utils/logger");

describe("Logger", () => {
  let consoleSpy;

  beforeEach(() => {
    // Restore console for these tests
    console.log = global.originalConsoleLog || console.log || (() => {});
    console.error = global.originalConsoleError || console.error || (() => {});
    console.warn = global.originalConsoleWarn || console.warn || (() => {});

    try {
      consoleSpy = {
        log: jest.spyOn(console, "log").mockImplementation(),
        error: jest.spyOn(console, "error").mockImplementation(),
        warn: jest.spyOn(console, "warn").mockImplementation(),
      };
    } catch (e) {
      consoleSpy = { log: null, error: null, warn: null };
    }
  });

  afterEach(() => {
    if (consoleSpy.log?.mockRestore) consoleSpy.log.mockRestore();
    if (consoleSpy.error?.mockRestore) consoleSpy.error.mockRestore();
    if (consoleSpy.warn?.mockRestore) consoleSpy.warn.mockRestore();
  });

  describe("header", () => {
    it("should print header with separator", () => {
      logger.header("Test Header");

      expect(consoleSpy.log).toHaveBeenCalledTimes(3);
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("="));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("Test Header"));
    });
  });

  describe("info", () => {
    it("should print info message with icon", () => {
      logger.info("Information message");

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("ℹ️"));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("Information message"));
    });
  });

  describe("success", () => {
    it("should print success message with checkmark", () => {
      logger.success("Operation successful");

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("✅"));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("Operation successful"));
    });
  });

  describe("warn", () => {
    it("should print warning message with icon", () => {
      logger.warn("Warning message");

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("⚠️"));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("Warning message"));
    });
  });

  describe("error", () => {
    it("should print error message", () => {
      logger.error("Error occurred");

      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining("❌"));
      expect(consoleSpy.error).toHaveBeenCalledWith(expect.stringContaining("Error: Error occurred"));
    });

    it("should not print stack trace when KAMI_DEBUG is false", () => {
      process.env.KAMI_DEBUG = "false";
      const error = new Error("Test error");

      logger.error("Error occurred", error);

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    it("should print stack trace when KAMI_DEBUG is true", () => {
      process.env.KAMI_DEBUG = "true";
      const error = new Error("Test error");

      // Re-require to pick up new env var
      jest.resetModules();
      const debugLogger = require("../../utils/logger");

      debugLogger.error("Error occurred", error);

      expect(consoleSpy.error).toHaveBeenCalledTimes(2);
    });
  });

  describe("debug", () => {
    it("should not print when KAMI_DEBUG is false", () => {
      process.env.KAMI_DEBUG = "false";

      logger.debug("Debug message");

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("should print when KAMI_DEBUG is true", () => {
      process.env.KAMI_DEBUG = "true";

      // Re-require to pick up new env var
      jest.resetModules();
      const debugLogger = require("../../utils/logger");

      debugLogger.debug("Debug message");

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("[DEBUG]"));
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("Debug message"));
    });
  });

  describe("hint", () => {
    it("should print hint message in gray", () => {
      logger.hint("Hint text");

      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining("Hint text"));
    });
  });

  describe("createReporter", () => {
    it("should create SummaryReporter instance", () => {
      const reporter = logger.createReporter("Test Report");

      expect(reporter).toBeDefined();
      expect(reporter.title).toBe("Test Report");
      expect(reporter.results).toEqual([]);
    });
  });
});

describe("SummaryReporter", () => {
  let consoleSpy;
  let reporter;

  beforeEach(() => {
    console.log = global.originalConsoleLog || console.log || (() => {});
    console.table = jest.fn();

    try {
      consoleSpy = jest.spyOn(console, "log").mockImplementation();
    } catch (e) {
      consoleSpy = null;
    }

    reporter = logger.createReporter("Test Summary");
  });

  afterEach(() => {
    if (consoleSpy?.mockRestore) consoleSpy.mockRestore();
  });

  describe("push", () => {
    it("should add result to results array", () => {
      reporter.push("Task 1", "SUCCESS", "Details");

      expect(reporter.results).toHaveLength(1);
      expect(reporter.results[0].Item).toBe("Task 1");
      expect(reporter.results[0].Details).toBe("Details");
    });

    it("should format SUCCESS status with checkmark", () => {
      reporter.push("Task 1", "SUCCESS");

      expect(reporter.results[0].Status).toContain("✅");
      expect(reporter.results[0].Status).toContain("SUCCESS");
    });

    it("should format ERROR status with X mark", () => {
      reporter.push("Task 1", "ERROR");

      expect(reporter.results[0].Status).toContain("❌");
      expect(reporter.results[0].Status).toContain("ERROR");
    });

    it("should store raw status for sorting", () => {
      reporter.push("Task 1", "SUCCESS");

      expect(reporter.results[0]._rawStatus).toBe("SUCCESS");
    });
  });

  describe("print", () => {
    it("should print summary header with duration", () => {
      reporter.print();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("📊 SUMMARY:"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Test Summary"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Completed in"));
    });

    it("should print table when results exist", () => {
      reporter.push("Task 1", "SUCCESS");
      reporter.print();

      expect(console.table).toHaveBeenCalled();
    });

    it("should print no tasks message when results are empty", () => {
      reporter.print();

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("No tasks processed"));
    });

    it("should sort errors before successes", () => {
      reporter.push("Task 1", "SUCCESS");
      reporter.push("Task 2", "ERROR");
      reporter.push("Task 3", "SUCCESS");

      reporter.print();

      const tableCall = console.table.mock.calls[0][0];
      expect(tableCall[0].Item).toBe("Task 2"); // Error first
    });

    it("should sort alphabetically within same status", () => {
      reporter.push("Zebra", "SUCCESS");
      reporter.push("Apple", "SUCCESS");
      reporter.push("Mango", "SUCCESS");

      reporter.print();

      const tableCall = console.table.mock.calls[0][0];
      expect(tableCall[0].Item).toBe("Apple");
      expect(tableCall[1].Item).toBe("Mango");
      expect(tableCall[2].Item).toBe("Zebra");
    });

    it("should remove internal sorting keys before display", () => {
      reporter.push("Task 1", "SUCCESS");
      reporter.print();

      const tableCall = console.table.mock.calls[0][0];
      expect(tableCall[0]._rawStatus).toBeUndefined();
    });

    it("should calculate duration since start", (done) => {
      setTimeout(() => {
        reporter.print();

        const durationCall = consoleSpy.mock.calls.find((call) => call[0].includes("Completed in"));
        expect(durationCall).toBeDefined();
        expect(durationCall[0]).toMatch(/\d+\.\d{2}s/);
        done();
      }, 100);
    });
  });
});
