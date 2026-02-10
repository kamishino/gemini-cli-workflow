/**
 * Config Adapter - Wraps cli-core ConfigManager
 * Handles configuration management
 */

import cliCore from '@kamiflow/cli-core';
const { ConfigManager } = cliCore;
import { executeWithRetryAndLogs } from './execute-wrapper.js';

export class ConfigAdapter {
  private projectPath: string;
  
  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }
  
  /**
   * Set a configuration value
   */
  async set(key: string, value: string, isGlobal: boolean = false): Promise<any> {
    return executeWithRetryAndLogs(
      async () => {
        const config = new ConfigManager();
        await config.set(key, value, isGlobal);
        return { key, value, isGlobal };
      },
      `✅ Set ${key} = ${value}`
    );
  }
  
  /**
   * Get a configuration value
   */
  async get(key: string): Promise<any> {
    return executeWithRetryAndLogs(
      async () => {
        const config = new ConfigManager();
        const value = await config.get(key);
        return { key, value };
      }
    );
  }
  
  /**
   * List all configuration values
   */
  async list(): Promise<any> {
    return executeWithRetryAndLogs(
      async () => {
        const config = new ConfigManager();
        const data = await config.list();
        return { configs: data };
      }
    );
  }
  
  /**
   * Sync local configuration with defaults
   */
  async sync(): Promise<any> {
    return executeWithRetryAndLogs(
      async () => {
        const config = new ConfigManager();
        const report = await config.syncLocalConfig();
        return report;
      },
      '✅ Configuration synchronized'
    );
  }
}
