/**
 * Global Configuration Management
 * Handles ~/.agk-config.json for machine-level settings (like brain path)
 */

const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const GLOBAL_CONFIG_PATH =
  process.env.AGK_CONFIG_PATH || path.join(os.homedir(), ".agk-config.json");

/**
 * Read the global config file
 */
async function getGlobalConfig() {
  if (!(await fs.pathExists(GLOBAL_CONFIG_PATH))) {
    return {};
  }
  try {
    return await fs.readJson(GLOBAL_CONFIG_PATH);
  } catch {
    return {};
  }
}

/**
 * Update a specific key in the global config
 */
async function setGlobalConfig(key, value) {
  const config = await getGlobalConfig();
  config[key] = value;
  await fs.writeJson(GLOBAL_CONFIG_PATH, config, { spaces: 2 });
  return config;
}

module.exports = {
  GLOBAL_CONFIG_PATH,
  getGlobalConfig,
  setGlobalConfig,
};
