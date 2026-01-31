/**
 * Transpiler Benchmark
 * Measures blueprint compilation and caching performance
 */

const { Transpiler } = require('../logic/transpiler');
const path = require('upath');

module.exports = async (runner) => {
  const projectRoot = path.join(__dirname, '../..');

  // Benchmark 1: Single partial load (cold)
  await runner.run('Transpiler: Load Partial (Cold)', async () => {
    const transpiler = new Transpiler(projectRoot);
    transpiler.cache.clear(); // Clear cache for cold load
    try {
      await transpiler.loadPartial('context-sync');
    } catch (error) {
      // Ignore errors if file doesn't exist in test env
    }
  }, 30);

  // Benchmark 2: Single partial load (warm/cached)
  await runner.run('Transpiler: Load Partial (Cached)', async () => {
    const transpiler = new Transpiler(projectRoot);
    try {
      await transpiler.loadPartial('context-sync'); // First load
      await transpiler.loadPartial('context-sync'); // Cached load
    } catch (error) {
      // Ignore errors if file doesn't exist in test env
    }
  }, 50);

  // Benchmark 3: Content sanitization
  await runner.run('Transpiler: Content Sanitization', async () => {
    const transpiler = new Transpiler(projectRoot);
    const testContent = `
      /./.kamiflow/test
      .gemini/rules/.gemini/rules/duplicate
      path//with///multiple////slashes
    `;
    transpiler.sanitizeContent(testContent);
  }, 200);

  // Benchmark 4: Cache statistics retrieval
  await runner.run('Transpiler: Cache Stats', async () => {
    const transpiler = new Transpiler(projectRoot);
    transpiler.cache.getStats();
  }, 500);

  // Benchmark 5: Parallel blueprint processing (simulated)
  await runner.run('Transpiler: Parallel Processing', async () => {
    const transpiler = new Transpiler(projectRoot);
    const mockBlueprints = Array.from({ length: 10 }, (_, i) => ({
      name: `test-${i}`,
      target: `.gemini/test-${i}.toml`
    }));
    
    // Simulate processing without actual file I/O
    await Promise.all(
      mockBlueprints.map(async (bp) => {
        return new Promise(resolve => setTimeout(resolve, 1));
      })
    );
  }, 20);
};
