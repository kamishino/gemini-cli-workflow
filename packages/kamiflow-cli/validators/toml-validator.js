const fs = require("fs-extra");
const path = require("upath");
const toml = require("@iarna/toml");
const chalk = require("chalk");

/**
 * Validates a single TOML file
 * @param {string} filePath
 * @returns {object} { valid: boolean, errors: string[] }
 */
function validateTomlFile(filePath) {
  const errors = [];

  // Check file exists
  if (!fs.existsSync(filePath)) {
    return { valid: false, errors: ["File not found"] };
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = toml.parse(content);

    // Validate required fields
    const requiredFields = ["description"];
    for (const field of requiredFields) {
      if (!parsed[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }
}

/**
 * Validates all TOML files in a directory or matching a pattern
 * @param {string} targetPath Directory or file path
 * @param {object} options { verbose: boolean }
 * @returns {Promise<object>} Validation results
 */
async function validateTomlFiles(targetPath, options = { verbose: true }) {
  const files = [];

  // Simple recursive search implementation for .toml files
  function findTomlFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        findTomlFiles(fullPath);
      } else if (item.endsWith(".toml")) {
        files.push(fullPath);
      }
    }
  }

  if (fs.existsSync(targetPath)) {
    if (fs.lstatSync(targetPath).isDirectory()) {
      findTomlFiles(targetPath);
    } else if (targetPath.endsWith(".toml")) {
      files.push(targetPath);
    }
  }

  if (options.verbose) {
    console.log(
      chalk.cyan(`Checking ${files.length} TOML files in: ${targetPath}`),
    );
  }

  let validCount = 0;
  let invalidCount = 0;
  const errors = [];

  for (const file of files) {
    const result = validateTomlFile(file);
    if (result.valid) {
      if (options.verbose)
        console.log(chalk.green(`✅ ${path.basename(file)} is valid.`));
      validCount++;
    } else {
      if (options.verbose) {
        console.error(chalk.red(`❌ ${path.basename(file)} is INVALID:`));
        console.error(chalk.yellow(result.errors.join("\n")));
      }
      invalidCount++;
      errors.push({ file, error: result.errors.join(", ") });
    }
  }

  return {
    total: files.length,
    valid: validCount,
    invalid: invalidCount,
    errors,
  };
}

module.exports = {
  validateTomlFile,
  validateTomlFiles,
};
