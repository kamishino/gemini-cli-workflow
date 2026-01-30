const fs = require('fs-extra');
const path = require('upath');
const os = require('os');

const CACHE_FILE = path.join(os.homedir(), '.kami-flow', 'update-cache.json');
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

async function getCache() {
  if (await fs.pathExists(CACHE_FILE)) {
    try {
      return await fs.readJson(CACHE_FILE);
    } catch (e) {
      return null;
    }
  }
  return null;
}

async function setCache(version) {
  await fs.ensureDir(path.dirname(CACHE_FILE));
  await fs.writeJson(CACHE_FILE, {
    latestVersion: version,
    lastChecked: Date.now()
  });
}

async function shouldCheck() {
  const cache = await getCache();
  if (!cache) return true;
  return (Date.now() - cache.lastChecked) > CHECK_INTERVAL;
}

module.exports = { getCache, setCache, shouldCheck };
