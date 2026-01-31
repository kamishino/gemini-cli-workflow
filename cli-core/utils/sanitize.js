/**
 * Input Sanitization Utility
 * Provides security functions to prevent injection attacks and path traversal
 */

const path = require("upath");

/**
 * Sanitize file path to prevent directory traversal attacks
 * @param {string} userPath - User-provided path
 * @param {string} basePath - Base directory to restrict to (optional)
 * @returns {string} Sanitized path
 * @throws {Error} If path traversal detected
 */
function sanitizePath(userPath, basePath = null) {
  if (typeof userPath !== "string") {
    throw new Error("Path must be a string");
  }

  // Normalize the path
  const normalized = path.normalize(userPath);

  // Check for path traversal attempts
  if (normalized.includes("..")) {
    throw new Error("Path traversal detected: .. not allowed");
  }

  // Check for absolute path escape attempts on Windows
  if (process.platform === "win32" && /^[A-Z]:\\/i.test(normalized) && basePath) {
    const absoluteBase = path.resolve(basePath);
    const absolutePath = path.resolve(normalized);
    if (!absolutePath.startsWith(absoluteBase)) {
      throw new Error("Path outside allowed directory");
    }
  }

  // If basePath provided, ensure path is within bounds
  if (basePath) {
    const resolved = path.resolve(basePath, normalized);
    const base = path.resolve(basePath);

    // Case-insensitive comparison on Windows
    const resolvedCompare = process.platform === "win32" ? resolved.toLowerCase() : resolved;
    const baseCompare = process.platform === "win32" ? base.toLowerCase() : base;

    if (!resolvedCompare.startsWith(baseCompare)) {
      throw new Error("Path outside allowed directory");
    }
  }

  return normalized;
}

/**
 * Sanitize shell command arguments to prevent injection
 * @param {string} arg - Command argument
 * @returns {string} Sanitized argument
 */
function sanitizeShellArg(arg) {
  if (typeof arg !== "string") {
    throw new Error("Argument must be a string");
  }

  // Escape shell metacharacters for different platforms
  if (process.platform === "win32") {
    // Windows CMD special characters
    return arg.replace(/[&|<>^()]/g, "^$&");
  } else {
    // Unix shell special characters
    return arg.replace(/[;&|`$()\\<>'"]/g, "\\$&");
  }
}

/**
 * Validate and sanitize JSON input
 * @param {string} input - JSON string
 * @returns {object} Parsed JSON object
 * @throws {Error} If JSON is invalid or too large
 */
function sanitizeJson(input, maxSize = 1024 * 1024) {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  // Check size to prevent DoS
  if (input.length > maxSize) {
    throw new Error(`JSON input too large (max ${maxSize} bytes)`);
  }

  try {
    return JSON.parse(input);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
}

/**
 * Sanitize file name to remove special characters
 * @param {string} filename - File name
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  if (typeof filename !== "string") {
    throw new Error("Filename must be a string");
  }

  // Remove path separators and special characters
  return filename
    .replace(/[/\\]/g, "") // Remove path separators
    .replace(/[<>:"|?*\x00-\x1f]/g, "") // Remove invalid filename chars
    .replace(/^\.+/, "") // Remove leading dots
    .trim();
}

/**
 * Validate URL to ensure it's HTTP/HTTPS
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidUrl(url) {
  if (typeof url !== "string") {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitize environment variable value
 * @param {string} value - Environment variable value
 * @returns {string} Sanitized value
 */
function sanitizeEnvVar(value) {
  if (typeof value !== "string") {
    return "";
  }

  // Remove potentially dangerous characters
  return value
    .replace(/[\r\n]/g, "") // Remove newlines
    .replace(/[\x00-\x1f\x7f]/g, "") // Remove control characters
    .trim();
}

/**
 * Validate package name (npm package naming rules)
 * @param {string} name - Package name
 * @returns {boolean} True if valid
 */
function isValidPackageName(name) {
  if (typeof name !== "string") {
    return false;
  }

  // npm package name rules
  const packageNameRegex = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
  return packageNameRegex.test(name) && name.length <= 214;
}

/**
 * Sanitize Git URL
 * @param {string} url - Git repository URL
 * @returns {string} Sanitized URL
 * @throws {Error} If URL is invalid
 */
function sanitizeGitUrl(url) {
  if (typeof url !== "string") {
    throw new Error("URL must be a string");
  }

  // Allow HTTPS and Git protocol
  const validProtocols = ["https:", "git:", "ssh:"];

  try {
    const parsed = new URL(url);
    if (!validProtocols.includes(parsed.protocol)) {
      throw new Error("Invalid Git URL protocol");
    }
    return url;
  } catch {
    // Try git@github.com:user/repo.git format
    if (/^git@[\w.-]+:[\w/-]+\.git$/.test(url)) {
      return url;
    }
    throw new Error("Invalid Git URL format");
  }
}

module.exports = {
  sanitizePath,
  sanitizeShellArg,
  sanitizeJson,
  sanitizeFilename,
  isValidUrl,
  sanitizeEnvVar,
  isValidPackageName,
  sanitizeGitUrl,
};
