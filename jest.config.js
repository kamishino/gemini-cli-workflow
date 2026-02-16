module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "packages/kamiflow-cli/logic/**/*.js",
    "packages/kamiflow-cli/utils/**/*.js",
    "packages/kamiflow-cli/validators/**/*.js",
    "!packages/kamiflow-cli/logic/installer.js", // Exclude installer (requires actual npm operations)
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/.git/"],
  setupFilesAfterEnv: ["<rootDir>/packages/kamiflow-cli/tests/setup.js"],
  verbose: true,
  maxWorkers: "50%",
};
