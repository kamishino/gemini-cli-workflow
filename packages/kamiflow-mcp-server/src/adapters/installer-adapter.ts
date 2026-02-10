/**
 * Installer Adapter - Wraps cli-core Installer
 * Handles project initialization and setup
 */

import cliCore from '@kamiflow/cli-core';
const { initializeProject } = cliCore.Installer || cliCore;
const { Doctor, Updater } = cliCore;
import { executeWithRetryAndLogs } from './execute-wrapper.js';
import path from 'path';

export class InstallerAdapter {
  /**
   * Initialize KamiFlow in a project directory
   */
  async init(projectPath: string, options: any = {}): Promise<any> {
    const absolutePath = path.resolve(projectPath);
    
    const result = await executeWithRetryAndLogs(
      async () => {
        // Use the function directly (not a class)
        await initializeProject(absolutePath, {
          mode: options.mode || 'link',
          dev: options.dev || false,
          skipInterview: options.skipInterview || false
        });
        return { path: absolutePath };
      },
      `✅ KamiFlow initialized in: ${absolutePath}`
    );
    
    return result;
  }
  
  /**
   * Check system health
   */
  async doctor(projectPath: string, options: any = {}): Promise<any> {
    const result = await executeWithRetryAndLogs(
      async () => {
        const doctor = new Doctor();
        const results = await doctor.run(projectPath, {
          fix: options.fix || false,
          autoFix: options.autoFix || false
        });
        return results;
      },
      '✅ Health check completed'
    );
    
    return result;
  }
  
  /**
   * Upgrade KamiFlow core
   */
  async upgrade(projectPath: string, options: any = {}): Promise<any> {
    const result = await executeWithRetryAndLogs(
      async () => {
        const updater = new Updater();
        const result = await updater.runUpdate(projectPath, {
          force: options.force || false
        });
        return result;
      },
      '✅ KamiFlow upgraded successfully'
    );
    
    return result;
  }
}
