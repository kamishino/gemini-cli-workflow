/* eslint-disable no-process-exit */
/**
 * Benchmark Runner for KamiFlow Performance Testing
 */

const chalk = require("chalk");
const path = require("upath");

class BenchmarkRunner {
  constructor() {
    this.results = [];
  }

  /**
   * Run a benchmark function
   * @param {string} name - Benchmark name
   * @param {Function} fn - Function to benchmark
   * @param {number} iterations - Number of iterations
   */
  async run(name, fn, iterations = 100) {
    console.log(chalk.cyan(`\n📊 Running: ${name}`));
    console.log(chalk.gray(`   Iterations: ${iterations}`));

    const times = [];
    let errors = 0;

    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      try {
        await fn();
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to ms
        times.push(duration);
      } catch (error) {
        errors++;
      }
    }

    if (times.length === 0) {
      console.log(chalk.red(`   ❌ All iterations failed`));
      return null;
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];

    const result = {
      name,
      iterations: times.length,
      errors,
      avg: avg.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
      median: median.toFixed(2),
    };

    this.results.push(result);

    console.log(chalk.green(`   ✓ Average: ${result.avg}ms`));
    console.log(
      chalk.gray(
        `   Min: ${result.min}ms | Max: ${result.max}ms | Median: ${result.median}ms`,
      ),
    );
    if (errors > 0) {
      console.log(chalk.yellow(`   ⚠️  Errors: ${errors}`));
    }

    return result;
  }

  /**
   * Print summary report
   */
  printSummary() {
    console.log(chalk.cyan("\n" + "=".repeat(60)));
    console.log(chalk.cyan.bold("  BENCHMARK SUMMARY"));
    console.log(chalk.cyan("=".repeat(60)));
    console.log();

    if (this.results.length === 0) {
      console.log(chalk.yellow("No benchmarks completed."));
      return;
    }

    console.table(
      this.results.map((r) => ({
        Benchmark: r.name,
        "Avg (ms)": r.avg,
        "Min (ms)": r.min,
        "Max (ms)": r.max,
        Iterations: r.iterations,
      })),
    );

    console.log();
  }

  /**
   * Compare two benchmarks
   */
  compare(baseline, current) {
    if (!baseline || !current) return;

    const improvement = (
      ((baseline.avg - current.avg) / baseline.avg) *
      100
    ).toFixed(2);
    const color = improvement > 0 ? chalk.green : chalk.red;
    const symbol = improvement > 0 ? "↓" : "↑";

    console.log(
      color(
        `\n${symbol} ${Math.abs(improvement)}% ${improvement > 0 ? "faster" : "slower"} than baseline`,
      ),
    );
  }
}

// Auto-run benchmarks if executed directly
if (require.main === module) {
  (async () => {
    const runner = new BenchmarkRunner();

    try {
      // Load benchmark suites
      const configBench = require("./config-loading.bench");
      const transpilerBench = require("./transpiler.bench");

      await configBench(runner);
      await transpilerBench(runner);

      runner.printSummary();
    } catch (error) {
      console.error(chalk.red("Benchmark failed:"), error.message);
      process.exit(1);
    }
  })();
}

module.exports = BenchmarkRunner;
