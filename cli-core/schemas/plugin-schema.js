/**
 * Plugin Registry Schema and Validation
 * Defines structure for KamiFlow plugins and marketplace entries
 */

const { z } = require('zod');

/**
 * Plugin manifest schema
 */
const PluginManifestSchema = z.object({
  name: z.string().min(1).max(100),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().min(10).max(500),
  author: z.string().min(1).max(100),
  license: z.string().default('MIT'),
  homepage: z.string().url().optional(),
  repository: z.object({
    type: z.enum(['git']),
    url: z.string().url()
  }).optional(),
  keywords: z.array(z.string()).max(10).default([]),
  category: z.enum([
    'workflow',
    'integration',
    'utility',
    'analysis',
    'automation',
    'devops',
    'testing',
    'documentation',
    'other'
  ]),
  
  // Plugin capabilities
  capabilities: z.object({
    commands: z.boolean().default(false),
    rules: z.boolean().default(false),
    hooks: z.boolean().default(false),
    config: z.boolean().default(false)
  }).default({}),
  
  // Compatibility
  engines: z.object({
    kamiflow: z.string().regex(/^[><=~^]*\d+\.\d+\.\d+$/),
    node: z.string().regex(/^[><=~^]*\d+\.\d+/).optional()
  }),
  
  // Dependencies
  dependencies: z.record(z.string()).optional(),
  peerDependencies: z.record(z.string()).optional(),
  
  // Plugin entry points
  main: z.string().default('index.js'),
  commands: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
  
  // Lifecycle hooks
  hooks: z.object({
    preInstall: z.string().optional(),
    postInstall: z.string().optional(),
    preUninstall: z.string().optional(),
    postUninstall: z.string().optional()
  }).optional(),
  
  // Configuration schema
  configSchema: z.record(z.any()).optional(),
  
  // Metadata
  tags: z.array(z.string()).max(20).default([]),
  icon: z.string().optional(),
  screenshots: z.array(z.string().url()).max(5).optional(),
  
  // Private flag
  private: z.boolean().default(false)
});

/**
 * Plugin registry entry schema (extends manifest with marketplace data)
 */
const PluginRegistryEntrySchema = PluginManifestSchema.extend({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  published: z.string().datetime(),
  updated: z.string().datetime(),
  downloads: z.number().int().min(0).default(0),
  rating: z.number().min(0).max(5).optional(),
  verified: z.boolean().default(false),
  deprecated: z.boolean().default(false),
  
  // Versions history
  versions: z.array(z.object({
    version: z.string(),
    published: z.string().datetime(),
    deprecated: z.boolean().default(false)
  })).optional(),
  
  // Maintainers
  maintainers: z.array(z.object({
    name: z.string(),
    email: z.string().email().optional()
  })).optional()
});

/**
 * Plugin installation config
 */
const PluginInstallConfigSchema = z.object({
  source: z.enum(['registry', 'git', 'local', 'npm']),
  identifier: z.string(),
  version: z.string().optional(),
  enabled: z.boolean().default(true),
  config: z.record(z.any()).optional(),
  installedAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional()
});

/**
 * Validate plugin manifest
 * @param {Object} manifest - Plugin manifest to validate
 * @returns {Object} Validation result
 */
function validatePluginManifest(manifest) {
  try {
    const validated = PluginManifestSchema.parse(manifest);
    return { valid: true, data: validated };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    };
  }
}

/**
 * Validate plugin registry entry
 * @param {Object} entry - Registry entry to validate
 * @returns {Object} Validation result
 */
function validateRegistryEntry(entry) {
  try {
    const validated = PluginRegistryEntrySchema.parse(entry);
    return { valid: true, data: validated };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    };
  }
}

/**
 * Validate plugin installation config
 * @param {Object} config - Installation config to validate
 * @returns {Object} Validation result
 */
function validateInstallConfig(config) {
  try {
    const validated = PluginInstallConfigSchema.parse(config);
    return { valid: true, data: validated };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    };
  }
}

/**
 * Check version compatibility
 * @param {string} required - Required version string (e.g., ">=2.35.0")
 * @param {string} current - Current version string
 * @returns {boolean} Whether versions are compatible
 */
function checkVersionCompatibility(required, current) {
  const parseVersion = (v) => {
    const match = v.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!match) return null;
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10)
    };
  };

  const reqVer = parseVersion(required);
  const curVer = parseVersion(current);

  if (!reqVer || !curVer) return false;

  // Handle operators
  if (required.startsWith('>=')) {
    return (
      curVer.major > reqVer.major ||
      (curVer.major === reqVer.major && curVer.minor > reqVer.minor) ||
      (curVer.major === reqVer.major && curVer.minor === reqVer.minor && curVer.patch >= reqVer.patch)
    );
  } else if (required.startsWith('>')) {
    return (
      curVer.major > reqVer.major ||
      (curVer.major === reqVer.major && curVer.minor > reqVer.minor) ||
      (curVer.major === reqVer.major && curVer.minor === reqVer.minor && curVer.patch > reqVer.patch)
    );
  } else if (required.startsWith('~')) {
    // ~1.2.3 means >=1.2.3 <1.3.0
    return curVer.major === reqVer.major && curVer.minor === reqVer.minor && curVer.patch >= reqVer.patch;
  } else if (required.startsWith('^')) {
    // ^1.2.3 means >=1.2.3 <2.0.0
    return curVer.major === reqVer.major && (
      curVer.minor > reqVer.minor ||
      (curVer.minor === reqVer.minor && curVer.patch >= reqVer.patch)
    );
  }

  // Exact match
  return curVer.major === reqVer.major && curVer.minor === reqVer.minor && curVer.patch === reqVer.patch;
}

module.exports = {
  PluginManifestSchema,
  PluginRegistryEntrySchema,
  PluginInstallConfigSchema,
  validatePluginManifest,
  validateRegistryEntry,
  validateInstallConfig,
  checkVersionCompatibility
};
