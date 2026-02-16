const chalk = require("chalk");
const cardRenderer = require("./card-renderer");

/**
 * Professional Logger for KamiFlow
 * Provides consistent formatting and iconography across the CLI.
 */
class Logger {
  constructor() {
    this.isDebug = process.env.KAMI_DEBUG === "true";
  }

  /**
   * Render a stylized memory card
   */
  card(data, options = {}) {
    console.log(cardRenderer.renderCard(data, options));
  }

  /**
   * Print a brand-consistent header with separator
   */
  header(text) {
    console.log(
      chalk.cyan(`\n========================================================`),
    );
    console.log(chalk.cyan.bold(`  ${text}`));
    console.log(
      chalk.cyan(`========================================================\n`),
    );
  }

  /**
   * General information log
   */
  info(text) {
    console.log(chalk.blue(`ℹ️  ${text}`));
  }

  /**
   * Success log with icon
   */
  success(text) {
    console.log(chalk.green(`✅ ${text}`));
  }

  /**
   * Warning log with icon
   */
  warn(text) {
    console.log(chalk.yellow(`⚠️  ${text}`));
  }

  /**
   * Error log - Friendly by default, verbose if DEBUG is enabled
   */
  error(text, err = null) {
    console.error(chalk.red.bold(`❌ Error: ${text}`));
    if (err && this.isDebug) {
      console.error(err);
    }
  }

  /**
   * Error log with actionable suggestions
   * @param {string} text - Error message
   * @param {string[]} suggestions - Array of suggestion strings
   */
  errorWithSuggestion(text, suggestions = []) {
    console.error(chalk.red.bold(`❌ Error: ${text}`));
    if (suggestions.length > 0) {
      console.log(chalk.yellow("\n  💡 Suggestions:"));
      suggestions.forEach((s) => {
        console.log(chalk.gray(`     → ${s}`));
      });
      console.log();
    }
  }

  /**
   * Debug-only log
   */
  debug(text) {
    if (this.isDebug) {
      console.log(chalk.gray(`[DEBUG] ${text}`));
    }
  }

  /**
   * Simple gray sub-text for details
   */
  hint(text) {
    console.log(chalk.gray(`   ${text}`));
  }

  /**
   * Create a new summary reporter for batch operations
   */
  createReporter(title) {
    return new SummaryReporter(title);
  }
}

/**
 * Helper to collect and display batch results
 */
class SummaryReporter {
  constructor(title) {
    this.title = title;
    this.results = [];
    this.startTime = Date.now();
  }

  push(name, status, message = "") {
    this.results.push({
      Item: name,
      Status:
        status === "SUCCESS"
          ? chalk.green("✅ SUCCESS")
          : chalk.red("❌ ERROR"),
      Details: message,
      _rawStatus: status, // Internal key for sorting
    });
  }

  print() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    // Sort results: 1. Errors first, 2. Details (Path) A-Z, 3. Item A-Z
    const sortedResults = [...this.results].sort((a, b) => {
      // Priority 1: Errors first
      if (a._rawStatus !== b._rawStatus) {
        return a._rawStatus === "ERROR" ? -1 : 1;
      }

      // Priority 2: Alphabetical by Details (Path)
      const detailA = a.Details || "";
      const detailB = b.Details || "";
      if (detailA && detailB && detailA !== detailB) {
        return detailA.localeCompare(detailB);
      }

      // Priority 3: Alphabetical by Item Name
      return a.Item.localeCompare(b.Item);
    });

    // Strip internal sorting keys before displaying
    const displayResults = sortedResults.map(({ _rawStatus, ...rest }) => rest);

    console.log(chalk.cyan(`\n📊 SUMMARY: ${this.title}`));
    console.log(chalk.gray(`   Completed in ${duration}s\n`));

    if (displayResults.length > 0) {
      console.table(displayResults);
    } else {
      console.log(chalk.gray("   No tasks processed."));
    }
    console.log();
  }
}

module.exports = new Logger(); // Singleton instance
