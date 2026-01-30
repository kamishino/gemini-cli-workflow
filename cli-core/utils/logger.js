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
}

module.exports = new Logger(); // Singleton instance
