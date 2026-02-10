#!/usr/bin/env node

/**
 * KamiFlow CLI Core - Module Exports
 * Exposes all logic modules for MCP server and other consumers
 * 
 * This file makes cli-core importable as a module
 * Usage: const { Installer, ConfigManager } = require('@kamiflow/cli-core');
 */

module.exports = {
  // ==================== CORE WORKFLOW ====================
  
  // Setup & Installation
  Installer: require('./logic/installer'),
  Doctor: require('./logic/doctor'),
  Updater: require('./logic/updater'),
  
  // Configuration & Environment
  ConfigManager: require('./logic/config-manager'),
  EnvironmentManager: require('./logic/env-manager'),
  LayeredResolver: require('./logic/layered-resolver'),
  CredentialManager: require('./logic/credential-manager'),
  
  // Project Management
  Archivist: require('./logic/archivist'),
  WorkspaceIndex: require('./logic/workspace-index'),
  
  // ==================== AUTOMATION ====================
  
  // Workflow Execution
  Saiyan: require('./logic/saiyan'),
  SuperSaiyan: require('./logic/supersaiyan'),
  
  // ==================== SYNC & STORAGE ====================
  
  SyncManager: require('./logic/sync-manager'),
  SyncSetup: require('./logic/sync-setup'),
  SyncDaemon: require('./logic/sync-daemon'),
  SyncClient: require('./logic/sync-client'),
  ConflictResolver: require('./logic/conflict-resolver'),
  
  // ==================== IDEAS & INSIGHTS ====================
  
  IdeaManager: require('./logic/idea-manager'),
  InsightManager: require('./logic/insight-manager'),
  
  // ==================== AGENT & PLUGIN ====================
  
  AgentManager: require('./logic/agent-manager'),
  PluginManager: require('./logic/plugin-manager'),
  SkillSync: require('./logic/skill-sync'),
  
  // ==================== FILE & WATCH ====================
  
  FileWatcher: require('./logic/file-watcher'),
  FsVault: require('./utils/fs-vault'),
  
  // ==================== GIT & VERSION ====================
  
  GitManager: require('./logic/git-manager'),
  
  // ==================== VALIDATION ====================
  
  DocAuditor: require('./logic/doc-auditor'),
  Healer: require('./logic/healer'),
  
  // ==================== UTILITIES ====================
  
  logger: require('./utils/logger'),
  i18n: require('./utils/i18n'),
  safeExec: require('./utils/safe-exec'),
  sanitize: require('./utils/sanitize'),
  visualizer: require('./utils/visualizer'),
  
  // ==================== VALIDATORS ====================
  
  validators: {
    toml: require('./validators/toml-validator')
  },
  
  // ==================== SCHEMAS ====================
  
  schemas: {
    plugin: require('./schemas/plugin-schema')
  },
  
  // ==================== BLUEPRINT ====================
  
  Transpiler: require('./logic/transpiler'),
  BlueprintCache: require('./utils/blueprint-cache'),
  PluginGenerator: require('./utils/plugin-generator'),
  
  // ==================== SWARM ====================
  
  SwarmDispatcher: require('./logic/swarm-dispatcher'),
  
  // ==================== DEFAULT CONFIG ====================
  
  defaultConfig: require('./default-config.json')
};

// Also export version
module.exports.version = require('./package.json').version;
