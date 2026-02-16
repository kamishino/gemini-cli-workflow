#!/usr/bin/env node

/**
 * Antigravity Kit - Health Check
 * CLI entry point for `npx antigravity-kit doctor`
 */

const doctor = require("../scripts/doctor");

// Run health check in current directory
doctor
  .run(process.cwd())
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error("Health check failed:", error.message);
    process.exit(1);
  });
