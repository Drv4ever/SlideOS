export default {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/data/**",
    "!src/middleware/auth.middleware.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  setupFiles: ["<rootDir>/__tests__/setup.js"],
  testTimeout: 30000,
  verbose: true,
};
