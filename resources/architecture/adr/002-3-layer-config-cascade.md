# ADR-002: 3-Layer Configuration Cascade

## Status
Accepted

## Context
KamiFlow needs a flexible configuration system that supports:
- System-wide defaults for all installations
- User-level preferences across projects
- Project-specific overrides
- Runtime environment variables

Without proper layering, configuration becomes:
- Difficult to manage across environments
- Impossible to share user preferences
- Prone to accidental system-wide changes

## Decision
Implement a **3-layer configuration cascade** with merge priority:

```
Default Config (Lowest Priority)
    ↓
Global Config (~/.kami-flow/.kamirc.json)
    ↓
Local Config (./kamirc.json) (Highest Priority)
```

### Layer Responsibilities

#### Layer 1: Default Configuration
- **Location:** `cli-core/default-config.json`
- **Purpose:** Fallback values, schema definition
- **Scope:** All KamiFlow installations
- **Immutable:** Cannot be changed by users
- **Version controlled:** Yes

#### Layer 2: Global Configuration
- **Location:** `~/.kami-flow/.kamirc.json`
- **Purpose:** User preferences across all projects
- **Scope:** Current user, all projects
- **Examples:** Language preference, default strategy
- **Managed by:** `kamiflow config set --global`

#### Layer 3: Local Configuration
- **Location:** `<project>/.kamirc.json`
- **Purpose:** Project-specific settings
- **Scope:** Single project
- **Examples:** Workspace paths, plugin config
- **Managed by:** `kamiflow config set` (no flag)
- **Git:** Usually gitignored

### Configuration Schema
```json
{
  "language": "english",
  "strategy": "BALANCED",
  "maxRetries": 3,
  "maxBackups": 5,
  "gatedAutomation": true,
  "executionMode": "Implementer",
  "currentEnv": "development",
  "environments": {
    "development": {
      "workspaceRoot": "./.kamiflow",
      "outputTargets": ["."]
    },
    "production": {
      "workspaceRoot": "./.kamiflow",
      "outputTargets": ["dist"]
    }
  },
  "plugins": {
    "seed": {
      "minFeasibility": 0.7
    }
  }
}
```

## Consequences

### Positive ✅
- **Flexibility** - Users can set preferences at appropriate scope
- **Inheritance** - Projects inherit sensible user defaults
- **Overridability** - Local config can override anything
- **Consistency** - Schema validation via Zod ensures correctness
- **Portability** - Projects work across different user environments
- **Discoverability** - `kamiflow config list` shows merged result

### Negative ⚠️
- **Complexity** - Users must understand precedence
- **Debugging** - Need to check multiple files for values
- **Synchronization** - Schema changes require migration
- **Cache invalidation** - Must clear cache on config changes

### Mitigation
- Clear documentation with examples
- `kamiflow config list` shows source of each value
- `kamiflow config sync` adds missing keys
- Legacy adapter handles old config formats

## Implementation Details

### Merge Algorithm
```javascript
1. Load default-config.json
2. Load ~/.kami-flow/.kamirc.json (if exists)
3. Load ./.kamirc.json (if exists)
4. Merge: Object.assign(default, global, local)
5. Validate with Zod schema
6. Cache result in memory
```

### Cache Strategy
- Cache full merged config after first load
- Invalidate cache on `set()` operations
- Re-load on next `get()` call
- Cache key: project path

### Dot Notation Support
```javascript
config.get('plugins.seed.minFeasibility')
// Equivalent to config['plugins']['seed']['minFeasibility']
```

### CLI Commands
```bash
# Local (project) scope
kamiflow config set language vietnamese
kamiflow config get language

# Global (user) scope
kamiflow config set --global strategy FAST

# View all with sources
kamiflow config list

# Sync with latest schema
kamiflow config sync
```

## Alternatives Considered

### 1. Single Configuration File
One `.kamirc.json` per project, no global config.
- **Rejected:** Forces duplication across projects

### 2. Environment Variables Only
Use `KAMI_*` env vars for all configuration.
- **Rejected:** Poor discoverability, no persistence

### 3. Registry-based (Windows-style)
Store config in OS registry (Windows) or similar.
- **Rejected:** Not cross-platform, hard to version control

### 4. 2-Layer (Skip Global)
Only default and local layers.
- **Rejected:** No way to set user-wide preferences

## Migration Strategy

### From Flat Keys to Nested Objects
Old format:
```json
{ "seed.minFeasibility": 0.8 }
```

New format:
```json
{ "plugins": { "seed": { "minFeasibility": 0.8 } } }
```

**Solution:** Legacy adapter in `ConfigManager.applyLegacyAdapter()`

### Adding New Keys
1. Add to `default-config.json`
2. Update Zod schema in `config-manager.js`
3. Users run `kamiflow config sync` to add missing keys

## Related Decisions
- ADR-005: Environment Management (dev/prod switching)

## References
- `cli-core/logic/config-manager.js`
- `cli-core/default-config.json`
- `cli-core/utils/update-cache.js`

---
**Date:** 2024-01-31  
**Author:** KamiFlow Team  
**Version:** 2.35.0
