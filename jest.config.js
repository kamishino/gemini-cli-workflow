module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'cli-core/logic/**/*.js',
    'cli-core/utils/**/*.js',
    'cli-core/validators/**/*.js',
    '!cli-core/logic/installer.js', // Exclude installer (requires actual npm operations)
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.git/'
  ],
  setupFilesAfterEnv: ['<rootDir>/cli-core/tests/setup.js'],
  verbose: true,
  maxWorkers: '50%'
};
