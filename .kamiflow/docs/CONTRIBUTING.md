# Contributing to KamiFlow

Thank you for your interest in contributing to KamiFlow! This guide will help you get started.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)

---

## Code of Conduct

- Be respectful and constructive
- Focus on what's best for the project
- Accept constructive criticism gracefully
- Help create a welcoming environment for all contributors

---

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm 7+
- Git
- Gemini CLI (optional for testing commands)

### Installation

1. **Fork the repository**
   ```bash
   # Via GitHub UI, click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/gemini-cli-workflow.git
   cd gemini-cli-workflow
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/kamishino/gemini-cli-workflow.git
   ```

4. **Install dependencies**
   ```bash
   cd cli-core
   npm install
   ```

5. **Run in development mode**
   ```bash
   npm run dev
   ```

---

## Development Setup

### Dev Mode vs Production Mode

**Development Mode:**
- Uses `KAMI_ENV=development`
- Reads blueprints from `resources/blueprints/`
- Output to project root (`.`)
- Hot reload enabled
- Debug logging available

**Production Mode:**
- Uses `KAMI_ENV=production`
- Transpiles to `dist/` directory
- Optimized for distribution
- Minimal logging

### Useful Commands

```bash
# Development
npm run dev              # Transpile blueprints (dev mode)
npm run transpile        # Manual transpilation
npm run sync             # Sync documentation

# Testing
npm test                 # Run test suite
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report

# Benchmarks
npm run bench            # Run all benchmarks
npm run bench:config     # Config loading benchmarks
npm run bench:transpiler # Transpiler benchmarks

# Build
npm run build            # Full production build
npm run clean            # Clean dist folder

# Validation
npm run doctor           # Health check
npm run validate         # TOML validation
```

---

## Project Structure

```
gemini-cli-workflow/
├── cli-core/                    # Main CLI package
│   ├── bin/kami.js             # CLI entry point
│   ├── logic/                   # Business logic modules
│   │   ├── config-manager.js   # Configuration cascade
│   │   ├── transpiler.js       # Blueprint → TOML factory
│   │   └── env-manager.js      # Environment handling
│   ├── utils/                   # Utility functions
│   │   ├── logger.js           # Console output
│   │   ├── sanitize.js         # Input validation
│   │   ├── safe-exec.js        # Secure command execution
│   │   └── i18n.js             # Internationalization
│   ├── tests/                   # Unit tests
│   ├── benchmarks/              # Performance tests
│   └── package.json
├── resources/                   # Source of Truth
│   ├── blueprints/             # Command logic (Markdown)
│   │   ├── commands/           # Command partials
│   │   ├── templates/          # Base templates
│   │   └── registry.md         # Blueprint → TOML mapping
│   ├── docs/                    # Documentation source
│   └── templates/              # File templates
├── .gemini/                     # Gemini CLI integration
│   ├── commands/kamiflow/      # Generated TOML commands
│   └── rules/                   # Protocol definitions
├── .kamiflow/                   # Workspace
│   ├── PROJECT_CONTEXT.md      # Project memory
│   └── ROADMAP.md              # Strategic vision
├── docs/                        # Documentation
│   ├── adr/                     # Architecture decisions
│   └── CONTRIBUTING.md          # This file
└── README.md
```

---

## Making Changes

### Branching Strategy

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Branch naming conventions:**
   - `feature/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation only
   - `refactor/` - Code refactoring
   - `test/` - Test additions/fixes
   - `perf/` - Performance improvements

### Code Style

#### JavaScript
- Use **ES6+** syntax
- **2 spaces** for indentation
- **Semicolons** are optional but be consistent
- **Template literals** for string interpolation
- **Async/await** over promises where possible
- **JSDoc** for all public functions

#### Example
```javascript
/**
 * Load configuration with validation
 * @param {string} key - Configuration key
 * @returns {Promise<*>} Configuration value
 */
async function loadConfig(key) {
  const value = await this.get(key);
  return value;
}
```

#### Naming Conventions
- **Variables:** camelCase (`configManager`)
- **Functions:** camelCase (`loadConfig`)
- **Classes:** PascalCase (`ConfigManager`)
- **Constants:** UPPER_CASE (`MAX_RETRIES`)
- **Files:** kebab-case (`config-manager.js`)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

**Examples:**
```bash
feat(transpiler): add blueprint caching system

Implements LRU cache for blueprint loading to improve
transpilation performance by 30%.

Closes #123
```

```bash
fix(config): resolve nested key retrieval bug

Fixed issue where dot notation wasn't working for
deeply nested configuration keys.

Fixes #456
```

---

## Testing

### Writing Tests

1. **Location:** Place tests in `cli-core/tests/` matching source structure
   ```
   cli-core/logic/config-manager.js
   cli-core/tests/logic/config-manager.test.js
   ```

2. **Naming:** Use `.test.js` suffix

3. **Structure:**
   ```javascript
   describe('ModuleName', () => {
     describe('methodName', () => {
       it('should do something specific', () => {
         / Test implementation
       });
     });
   });
   ```

4. **Coverage targets:**
   - **Logic modules:** 80%+
   - **Utils:** 70%+
   - **Overall:** 60%+

### Running Tests

```bash
# All tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# With coverage
npm run test:coverage

# Specific file
npm test config-manager.test.js

# Verbose output
npm run test:verbose
```

### Test Helpers

Use provided test utilities:
```javascript
const { mockConfig, mockProjectPaths } = require('../helpers/fixtures');
const { createMockFs } = require('../helpers/fs-mock');
```

---

## Documentation

### JSDoc Requirements

All public functions must have JSDoc:
- Parameter types
- Return types
- Examples for complex APIs
- Error conditions

See [JSDoc Standards](./JSDOC_STANDARDS.md) for detailed guidelines.

### ADR (Architecture Decision Records)

When making significant architectural changes:

1. Create `docs/adr/NNN-title.md`
2. Follow ADR template
3. Include:
   - Status (Proposed/Accepted/Deprecated)
   - Context (problem being solved)
   - Decision (what was chosen)
   - Consequences (trade-offs)
   - Alternatives considered

### Markdown Documentation

- Use **GitHub-flavored Markdown**
- Include **code examples**
- Add **links** to related docs
- Keep **line length** under 100 characters
- Use **tables** for structured data

---

## Submitting Changes

### Before Submitting

1. **Run tests**
   ```bash
   npm test
   ```

2. **Check coverage**
   ```bash
   npm run test:coverage
   ```

3. **Validate TOML** (if you changed commands)
   ```bash
   npm run validate
   ```

4. **Run benchmarks** (if you changed performance-critical code)
   ```bash
   npm run bench
   ```

5. **Update documentation** (if needed)
   - Update README if adding features
   - Add JSDoc to new functions
   - Create ADR for architectural changes

### Pull Request Process

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub
   - Use a descriptive title
   - Reference related issues
   - Describe changes clearly
   - Include test results
   - Add screenshots (if UI changes)

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Tests pass locally
   - [ ] New tests added
   - [ ] Coverage maintained/improved
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] JSDoc added/updated
   - [ ] Documentation updated
   - [ ] No breaking changes (or clearly documented)
   
   ## Related Issues
   Fixes #123
   Closes #456
   ```

4. **Code Review**
   - Address reviewer comments
   - Push additional commits as needed
   - Squash commits if requested

5. **Merge**
   - Maintainers will merge once approved
   - Delete your branch after merge

---

## Specific Contribution Areas

### Adding New Commands

1. **Create blueprint** in `resources/blueprints/commands/`
2. **Add metadata** (name, type, description, group, order)
3. **Update registry** in `resources/blueprints/registry.md`
4. **Test transpilation**
   ```bash
   npm run dev
   ```
5. **Validate TOML**
   ```bash
   npm run validate
   ```

### Adding Translations

1. **Update locale files:**
   - `cli-core/locales/en.json`
   - `cli-core/locales/vi.json`

2. **Use in code:**
   ```javascript
   const { t } = require('../utils/i18n');
   logger.info(t('common.success', { message: 'Task complete' }));
   ```

### Performance Improvements

1. **Benchmark first**
   ```bash
   npm run bench
   ```

2. **Make changes**

3. **Benchmark again** and compare

4. **Document improvement** in PR description

---

## Getting Help

- **Issues:** [GitHub Issues](https://github.com/kamishino/gemini-cli-workflow/issues)
- **Discussions:** [GitHub Discussions](https://github.com/kamishino/gemini-cli-workflow/discussions)
- **Documentation:** Check `/docs` folder
- **Questions:** Open a discussion or issue

---

## Recognition

Contributors will be:
- Listed in CHANGELOG.md
- Credited in release notes
- Added to contributors list (if significant contributions)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to KamiFlow! 🌊**
