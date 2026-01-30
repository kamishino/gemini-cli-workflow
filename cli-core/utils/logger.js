const chalk = require('chalk');

/**
 * Professional Logger for KamiFlow
 * Provides consistent formatting and iconography across the CLI.
 */
class Logger {
  constructor() {
    this.isDebug = process.env.KAMI_DEBUG === 'true';
  }

  /**
   * Print a brand-consistent header with separator
   */
  header(text) {
    console.log(chalk.cyan(`\n========================================================`));
    console.log(chalk.cyan.bold(`  ${text}`));
    console.log(chalk.cyan(`========================================================\n`));
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

  push(name, status, message = '') {
    this.results.push({
      Item: name,
      Status: status === 'SUCCESS' ? chalk.green('✅ SUCCESS') : chalk.red('❌ ERROR'),
      Details: message
    });
  }

  print() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(chalk.cyan(`\n📊 SUMMARY: ${this.title}`));
    console.log(chalk.gray(`   Completed in ${duration}s\n`));
    
    if (this.results.length > 0) {
      console.table(this.results);
    } else {
      console.log(chalk.gray("   No tasks processed."));
    }
    console.log();
  }
}

module.exports = new Logger(); // Singleton instance
