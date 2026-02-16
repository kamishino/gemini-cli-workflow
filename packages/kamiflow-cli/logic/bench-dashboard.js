/* eslint-disable no-process-exit */
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("upath");
const logger = require("../utils/logger");
const BenchmarkRunner = require("../benchmarks/runner");

/**
 * Benchmark Dashboard - Persistent benchmark history with comparison and ASCII charts
 */

const HISTORY_FILE = ".kamiflow/benchmarks.json";
const DEFAULT_THRESHOLD = 500; // ms

/**
 * Load benchmark history from disk
 * @param {string} projectRoot - Project root path
 * @returns {object[]} Array of past benchmark runs
 */
async function loadHistory(projectRoot) {
  const historyPath = path.join(projectRoot, HISTORY_FILE);
  if (await fs.pathExists(historyPath)) {
    return fs.readJson(historyPath);
  }
  return [];
}

/**
 * Save a benchmark run to history
 * @param {string} projectRoot - Project root path
 * @param {object} run - Benchmark run data
 */
async function saveToHistory(projectRoot, run) {
  const historyPath = path.join(projectRoot, HISTORY_FILE);
  const history = await loadHistory(projectRoot);

  history.push({
    timestamp: new Date().toISOString(),
    results: run,
  });

  // Keep last 50 runs
  const trimmed = history.slice(-50);
  await fs.ensureDir(path.dirname(historyPath));
  await fs.writeJson(historyPath, trimmed, { spaces: 2 });
}

/**
 * Render a sparkline-style mini chart from values
 * @param {number[]} values - Array of durations
 * @param {number} width - Chart width
 * @returns {string} ASCII sparkline
 */
function sparkline(values, width = 20) {
  if (values.length === 0) return chalk.gray("─".repeat(width));

  const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Sample or pad to fit width
  const sampled = [];
  const step = Math.max(1, Math.floor(values.length / width));
  for (let i = 0; i < values.length && sampled.length < width; i += step) {
    sampled.push(values[i]);
  }

  return sampled
    .map((v) => {
      const idx = Math.min(
        blocks.length - 1,
        Math.floor(((v - min) / range) * (blocks.length - 1)),
      );
      const char = blocks[idx];
      return v > DEFAULT_THRESHOLD ? chalk.red(char) : chalk.cyan(char);
    })
    .join("");
}

/**
 * Run benchmarks and display dashboard
 * @param {object} options - Dashboard options
 */
async function runBenchDashboard(options = {}) {
  const projectRoot = options.projectRoot || process.cwd();

  // Mode: View history only
  if (options.history) {
    await showHistory(projectRoot, parseInt(options.history) || 10);
    return;
  }

  // Run benchmarks
  const runner = new BenchmarkRunner();

  console.log();
  logger.header("Performance Benchmarks");

  try {
    // Core benchmarks
    const configBench = require("../benchmarks/config-loading.bench");
    const transpilerBench = require("../benchmarks/transpiler.bench");

    await configBench(runner);
    await transpilerBench(runner);
  } catch (error) {
    logger.warn(`Some benchmarks skipped: ${error.message}`);
  }

  // Quick CLI benchmarks (lightweight, 10 iterations)
  await runner.run(
    "CLI Help",
    () => {
      const { execSync } = require("child_process");
      execSync("node " + path.join(__dirname, "../bin/kami.js") + " --help", {
        stdio: "pipe",
      });
    },
    10,
  );

  // Print summary
  runner.printSummary();

  // Save to history
  const results = runner.results;
  await saveToHistory(projectRoot, results);
  logger.success("Results saved to " + HISTORY_FILE);

  // Compare with previous if requested
  if (options.compare) {
    const history = await loadHistory(projectRoot);
    if (history.length >= 2) {
      const previous = history[history.length - 2];
      const current = history[history.length - 1];
      showComparison(previous, current);
    } else {
      logger.hint("Not enough history for comparison. Run again to compare.");
    }
  }

  // Check thresholds
  const warnings = results.filter((r) => parseFloat(r.avg) > DEFAULT_THRESHOLD);
  if (warnings.length > 0) {
    console.log(
      chalk.yellow(
        `\n⚠️  ${warnings.length} benchmark(s) exceeded ${DEFAULT_THRESHOLD}ms threshold:`,
      ),
    );
    warnings.forEach((w) => {
      console.log(chalk.red(`   • ${w.name}: ${w.avg}ms`));
    });
    console.log();
  }
}

/**
 * Show comparison between two benchmark runs
 */
function showComparison(previous, current) {
  console.log(chalk.cyan("\n📊 Comparison with Previous Run"));
  console.log(
    chalk.gray(`   Previous: ${new Date(previous.timestamp).toLocaleString()}`),
  );
  console.log(
    chalk.gray(
      `   Current:  ${new Date(current.timestamp).toLocaleString()}\n`,
    ),
  );

  for (const curr of current.results) {
    const prev = previous.results.find((r) => r.name === curr.name);
    if (!prev) continue;

    const prevAvg = parseFloat(prev.avg);
    const currAvg = parseFloat(curr.avg);
    const diff = ((prevAvg - currAvg) / prevAvg) * 100;
    const absDiff = Math.abs(diff).toFixed(1);

    let indicator;
    if (diff > 5) {
      indicator = chalk.green(`↓ ${absDiff}% faster`);
    } else if (diff < -5) {
      indicator = chalk.red(`↑ ${absDiff}% slower`);
    } else {
      indicator = chalk.gray(`≈ no change`);
    }

    console.log(
      chalk.white(`   ${curr.name}: `) +
        chalk.gray(`${prevAvg}ms → ${currAvg}ms `) +
        indicator,
    );
  }
  console.log();
}

/**
 * Show benchmark history with sparklines
 */
async function showHistory(projectRoot, count) {
  const history = await loadHistory(projectRoot);

  if (history.length === 0) {
    logger.info("No benchmark history found. Run `kamiflow perf` first.\n");
    return;
  }

  console.log();
  logger.header("Benchmark History");
  console.log(
    chalk.gray(`  Showing last ${Math.min(count, history.length)} runs\n`),
  );

  // Collect all unique benchmark names
  const names = new Set();
  history.forEach((run) => {
    run.results.forEach((r) => names.add(r.name));
  });

  // For each benchmark, show trend
  const recentHistory = history.slice(-count);

  for (const name of names) {
    const values = recentHistory
      .map((run) => {
        const r = run.results.find((x) => x.name === name);
        return r ? parseFloat(r.avg) : null;
      })
      .filter((v) => v !== null);

    if (values.length === 0) continue;

    const latest = values[values.length - 1];
    const trend = sparkline(values);
    const color = latest > DEFAULT_THRESHOLD ? chalk.red : chalk.green;

    console.log(chalk.white(`  ${name}`));
    console.log(
      chalk.gray("    ") + trend + "  " + color(`${latest.toFixed(1)}ms`),
    );
  }

  // Timestamps
  console.log(
    chalk.gray(
      `\n  First: ${new Date(recentHistory[0].timestamp).toLocaleString()}`,
    ),
  );
  console.log(
    chalk.gray(
      `  Last:  ${new Date(recentHistory[recentHistory.length - 1].timestamp).toLocaleString()}\n`,
    ),
  );
}

module.exports = {
  runBenchDashboard,
  loadHistory,
  saveToHistory,
  showComparison,
  showHistory,
  sparkline,
};
