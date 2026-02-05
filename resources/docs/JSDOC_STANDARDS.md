# JSDoc Standards for KamiFlow

This document defines JSDoc conventions for consistent API documentation across the KamiFlow codebase.

## General Principles

1. **Every public function must have JSDoc**
2. **Private functions should have JSDoc for complex logic**
3. **Classes must document constructor parameters**
4. **Use TypeScript-style type annotations**
5. **Include examples for non-obvious APIs**

---

## Basic Template

```javascript
/**
 * Brief one-line description of the function
 * 
 * Optional longer description that provides context,
 * explains behavior, and documents edge cases.
 * 
 * @param {Type} paramName - Parameter description
 * @param {Type} [optionalParam] - Optional parameter description
 * @param {Type} [paramWithDefault=defaultValue] - Parameter with default
 * @returns {Type} Return value description
 * @throws {ErrorType} When this error occurs
 * @example
 * const result = functionName(param1, param2);
 * console.log(result); // Expected output
 */
function functionName(paramName, optionalParam, paramWithDefault = 'default') {
  // implementation
}
```

---

## Type Definitions

### Primitive Types
- `{string}` - String values
- `{number}` - Numeric values
- `{boolean}` - Boolean values
- `{null}` - Null value
- `{undefined}` - Undefined value

### Complex Types
- `{Array}` - Generic array
- `{Array<string>}` - Array of strings
- `{Object}` - Generic object
- `{Function}` - Function type
- `{Promise}` - Promise (untyped)
- `{Promise<string>}` - Promise resolving to string

### Custom Types
Use `@typedef` for complex structures:

```javascript
/**
 * @typedef {Object} ConfigOptions
 * @property {string} language - UI language
 * @property {string} strategy - Execution strategy
 * @property {number} maxRetries - Maximum retry attempts
 * @property {boolean} gatedAutomation - Require user approval
 */

/**
 * Load configuration with options
 * @param {ConfigOptions} options - Configuration options
 * @returns {Promise<Object>} Loaded configuration
 */
async function loadConfig(options) {
  // implementation
}
```

### Union Types
```javascript
/**
 * @param {string|number} id - User ID (string or number)
 * @param {'success'|'error'|'pending'} status - Operation status
 */
```

### Nullable Types
```javascript
/**
 * @param {?string} value - String or null
 * @param {string|null} value - Alternative syntax
 */
```

---

## Class Documentation

### Class Definition
```javascript
/**
 * Manages configuration loading and merging
 * 
 * This class handles the 3-layer configuration cascade:
 * Default → Global → Local with validation and caching.
 * 
 * @class
 * @example
 * const config = new ConfigManager('/path/to/project');
 * const value = await config.get('language');
 */
class ConfigManager {
  /**
   * Create a new ConfigManager instance
   * @param {string} [projectPath=process.cwd()] - Path to project root
   */
  constructor(projectPath = process.cwd()) {
    // implementation
  }
}
```

### Method Documentation
```javascript
/**
 * Get configuration value by key
 * 
 * Supports dot notation for nested keys (e.g., 'plugins.seed.minFeasibility').
 * Returns undefined if key doesn't exist.
 * 
 * @param {string} key - Configuration key
 * @returns {Promise<*>} Configuration value or undefined
 * @example
 * const lang = await config.get('language');
 * const threshold = await config.get('plugins.seed.minFeasibility');
 */
async get(key) {
  // implementation
}
```

---

## Async Functions

Always indicate async functions and their return types:

```javascript
/**
 * Fetch user data from API
 * @async
 * @param {string} userId - User identifier
 * @returns {Promise<Object>} User data object
 * @throws {Error} If user not found or network error
 */
async function fetchUser(userId) {
  // implementation
}
```

---

## Callbacks

```javascript
/**
 * Process items with callback
 * @param {Array<string>} items - Items to process
 * @param {Function} callback - Callback function
 * @param {string} callback.item - Current item
 * @param {number} callback.index - Current index
 * @returns {void}
 */
function processItems(items, callback) {
  items.forEach((item, index) => callback(item, index));
}
```

---

## Examples

### Good Example ✅
```javascript
/**
 * Sanitize file path to prevent directory traversal
 * 
 * Normalizes the path and checks for '..' sequences that could
 * allow escaping the base directory. Optionally restricts paths
 * to within a specified base directory.
 * 
 * @param {string} userPath - User-provided path to sanitize
 * @param {string} [basePath=null] - Optional base directory restriction
 * @returns {string} Sanitized path
 * @throws {Error} If path traversal detected
 * @example
 * sanitizePath('../../etc/passwd'); // Throws Error
 * sanitizePath('./safe/path.txt'); // Returns './safe/path.txt'
 * sanitizePath('../file.txt', '/base'); // Throws Error
 */
function sanitizePath(userPath, basePath = null) {
  // implementation
}
```

### Bad Example ❌
```javascript
// No JSDoc at all
function sanitizePath(userPath, basePath) {
  // implementation
}

// Or minimal JSDoc
/**
 * Sanitizes a path
 * @param {string} userPath
 * @param {string} basePath
 */
function sanitizePath(userPath, basePath) {
  // implementation
}
```

---

## IDE Integration

### VSCode Settings
Add to `.vscode/settings.json`:

```json
{
  "javascript.suggest.completeJSDocs": true,
  "javascript.validate.enable": true,
  "javascript.suggestionActions.enabled": true
}
```

### Type Checking
Enable type checking without TypeScript:

```javascript
// @ts-check
```

At the top of any JavaScript file to enable TypeScript-powered type checking.

---

## Documentation Generation

To generate HTML documentation from JSDoc:

```bash
npm install -g jsdoc
jsdoc -c jsdoc.json
```

Sample `jsdoc.json`:
```json
{
  "source": {
    "include": ["cli-core/logic", "cli-core/utils"],
    "exclude": ["node_modules"]
  },
  "opts": {
    "destination": "docs/api",
    "recurse": true
  }
}
```

---

## Special Tags

### Deprecated
```javascript
/**
 * Old function - use newFunction() instead
 * @deprecated Since version 2.0.0 - Use {@link newFunction}
 */
```

### See Also
```javascript
/**
 * @see {@link OtherClass}
 * @see {@link https://example.com/docs}
 */
```

### Since
```javascript
/**
 * @since 2.35.0
 */
```

### TODO
```javascript
/**
 * @todo Add input validation
 * @todo Implement caching
 */
```

---

## Maintenance

- **Review JSDoc during code reviews**
- **Update JSDoc when changing function signatures**
- **Add examples for complex APIs**
- **Keep descriptions concise but complete**

---

## Checklist

Before committing code, ensure:

- [ ] All public functions have JSDoc
- [ ] Parameter types are specified
- [ ] Return types are documented
- [ ] Async functions marked with `@async`
- [ ] Examples provided for non-obvious usage
- [ ] Complex types defined with `@typedef`
- [ ] Error conditions documented with `@throws`

