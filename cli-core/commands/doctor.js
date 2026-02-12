/* eslint-disable no-process-exit */
const { runDoctor } = require("../logic/doctor");
const logger = require("../utils/logger");

module.exports = {
  name: "check-health",
  alias: "doctor",
  description: "Check system health and KamiFlow configuration",
  options: [
    {
      flags: "--fix",
      description: "Attempt to automatically fix detected issues",
    },
    {
      flags: "--auto-fix",
      description: "Bypass confirmation prompts during healing",
    },
  ],
  action: async (options) => {
    const results = await runDoctor(options);
    if (results.allHealthy) {
      logger.success("All systems operational!\n");
    } else {
      logger.warn("Some issues detected. See above for details.\n");
      process.exit(1);
    }
  },
};
