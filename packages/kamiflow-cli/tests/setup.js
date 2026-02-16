/**
 * Jest Test Environment Setup
 * Runs before each test suite
 */

// Set test environment variables
process.env.KAMI_ENV = "test";
process.env.NODE_ENV = "test";
process.env.KAMI_DEBUG = "false";

// Suppress console output during tests (can be overridden per test)
global.originalConsoleLog = console.log;
global.originalConsoleError = console.error;
global.originalConsoleWarn = console.warn;

// Mock console to reduce noise
beforeAll(() => {
  if (process.env.JEST_VERBOSE !== "true") {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  console.log = global.originalConsoleLog;
  console.error = global.originalConsoleError;
  console.warn = global.originalConsoleWarn;
});

// Add custom matchers
expect.extend({
  toBeValidPath(received) {
    const pass = typeof received === "string" && received.length > 0;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid path`
          : `expected ${received} to be a valid path`,
    };
  },

  toBeAbsolutePath(received) {
    const path = require("upath");
    const pass = path.isAbsolute(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be an absolute path`
          : `expected ${received} to be an absolute path`,
    };
  },
});
