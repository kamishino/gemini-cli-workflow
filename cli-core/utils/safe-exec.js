/**
 * Safe Command Execution Utility
 * Provides secure wrappers for executing shell commands
 */

const execa = require("execa");
const { sanitizeShellArg } = require("./sanitize");
const logger = require("./logger");

/**
 * Safely execute a command with timeout and error handling
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @param {object} options - Execution options
 * @returns {Promise<object>} Execution result
 */
async function safeExec(command, args = [], options = {}) {
  const {
    timeout = 30000, // 30 seconds default
    cwd = process.cwd(),
    sanitizeArgs = true,
    stdio = "pipe",
    env = process.env,
  } = options;

  // Validate command
  if (!command || typeof command !== "string") {
    throw new Error("Invalid command");
  }

  // Sanitize arguments if requested
  const processedArgs = sanitizeArgs
    ? args.map((arg) => sanitizeShellArg(String(arg)))
    : args;

  try {
    logger.debug(`Executing: ${command} ${processedArgs.join(" ")}`);

    const result = await execa(command, processedArgs, {
      cwd,
      timeout,
      stdio,
      env,
      reject: false, // Don't throw on non-zero exit
      cleanup: true,
      killSignal: "SIGTERM",
    });

    if (result.failed) {
      logger.debug(`Command failed with exit code ${result.exitCode}`);
    }

    return {
      success: !result.failed,
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      command: result.command,
    };
  } catch (error) {
    // Handle timeout and other errors
    if (error.timedOut) {
      logger.error(`Command timed out after ${timeout}ms`);
      throw new Error(`Command execution timed out: ${command}`);
    }

    logger.error(`Command execution failed: ${error.message}`);
    throw error;
  }
}

/**
 * Execute command and return stdout or throw on error
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @param {object} options - Execution options
 * @returns {Promise<string>} Command stdout
 */
async function safeExecOrThrow(command, args = [], options = {}) {
  const result = await safeExec(command, args, options);

  if (!result.success) {
    const error = new Error(`Command failed: ${command}`);
    error.exitCode = result.exitCode;
    error.stderr = result.stderr;
    throw error;
  }

  return result.stdout;
}

/**
 * Check if a command exists in PATH
 * @param {string} command - Command name
 * @returns {Promise<boolean>}
 */
async function commandExists(command) {
  const isWindows = process.platform === "win32";
  const checkCommand = isWindows ? "where" : "which";

  try {
    const result = await safeExec(checkCommand, [command], {
      stdio: "ignore",
      timeout: 5000,
    });
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Get command version safely
 * @param {string} command - Command name
 * @param {string[]} versionArgs - Arguments to get version (default: ['--version'])
 * @returns {Promise<string|null>} Version string or null
 */
async function getCommandVersion(command, versionArgs = ["--version"]) {
  try {
    const result = await safeExec(command, versionArgs, {
      timeout: 5000,
      stdio: "pipe",
    });

    if (result.success) {
      return result.stdout.trim().split("\n")[0];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Execute command with real-time output streaming
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @param {object} options - Execution options
 * @returns {Promise<object>}
 */
async function safeExecStreaming(command, args = [], options = {}) {
  const {
    timeout = 300000, // 5 minutes for long-running commands
    cwd = process.cwd(),
    sanitizeArgs = true,
    env = process.env,
  } = options;

  const processedArgs = sanitizeArgs
    ? args.map((arg) => sanitizeShellArg(String(arg)))
    : args;

  try {
    logger.debug(
      `Executing (streaming): ${command} ${processedArgs.join(" ")}`,
    );

    const subprocess = execa(command, processedArgs, {
      cwd,
      timeout,
      env,
      cleanup: true,
      killSignal: "SIGTERM",
    });

    // Stream output to console
    if (subprocess.stdout) {
      subprocess.stdout.pipe(process.stdout);
    }
    if (subprocess.stderr) {
      subprocess.stderr.pipe(process.stderr);
    }

    const result = await subprocess;

    return {
      success: true,
      exitCode: result.exitCode,
      command: result.command,
    };
  } catch (error) {
    if (error.timedOut) {
      throw new Error(`Command timed out after ${timeout}ms: ${command}`);
    }

    return {
      success: false,
      exitCode: error.exitCode || 1,
      error: error.message,
    };
  }
}

/**
 * Execute npm command safely
 * @param {string[]} args - npm arguments
 * @param {object} options - Execution options
 * @returns {Promise<object>}
 */
async function safeNpmExec(args, options = {}) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  return safeExec(npmCommand, args, {
    ...options,
    sanitizeArgs: false, // npm handles its own argument parsing
  });
}

/**
 * Execute git command safely
 * @param {string[]} args - git arguments
 * @param {object} options - Execution options
 * @returns {Promise<object>}
 */
async function safeGitExec(args, options = {}) {
  return safeExec("git", args, {
    ...options,
    sanitizeArgs: false, // git handles its own argument parsing
  });
}

module.exports = {
  safeExec,
  safeExecOrThrow,
  commandExists,
  getCommandVersion,
  safeExecStreaming,
  safeNpmExec,
  safeGitExec,
};
