/**
 * Config Loading Benchmark
 * Measures configuration cascade performance
 */

const { ConfigManager } = require('../logic/config-manager');
const path = require('upath');

module.exports = async (runner) => {
  const testRoot = path.join(__dirname, '../tests');

  // Benchmark 1: Cold load (no cache)
  await runner.run('Config: Cold Load', async () => {
    const config = new ConfigManager(testRoot);
    config.cache = null; // Force cold load
    await config.loadAll();
  }, 50);

  // Benchmark 2: Warm load (cached)
  await runner.run('Config: Warm Load', async () => {
    const config = new ConfigManager(testRoot);
    await config.loadAll(); // First load populates cache
    await config.loadAll(); // Second load uses cache
  }, 50);

  // Benchmark 3: Single key retrieval
  await runner.run('Config: Get Single Key', async () => {
    const config = new ConfigManager(testRoot);
    await config.get('language');
  }, 100);

  // Benchmark 4: Nested key retrieval
  await runner.run('Config: Get Nested Key', async () => {
    const config = new ConfigManager(testRoot);
    await config.get('plugins.seed.minFeasibility');
  }, 100);

  // Benchmark 5: Config sync operation
  await runner.run('Config: Sync Operation', async () => {
    const config = new ConfigManager(testRoot);
    await config.syncLocalConfig();
  }, 20);
};
