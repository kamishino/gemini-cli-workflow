/**
 * Workflow Adapter - Wraps cli-core Saiyan and SuperSaiyan
 * Handles autonomous execution modes
 */

import cliCore from '@kamiflow/cli-core';
const { Saiyan, SuperSaiyan } = cliCore;
import { executeWithRetryAndLogs } from './execute-wrapper.js';

export class WorkflowAdapter {
  private projectPath: string;
  
  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }
  
  /**
   * Run Saiyan mode (autonomous task execution)
   */
  async runSaiyan(input: string, strategy: string = 'BALANCED'): Promise<any> {
    return executeWithRetryAndLogs(
      async () => {
        const saiyan = new Saiyan();
        const result = await saiyan.runSaiyanMode(input, {
          strategy
        });
        return result;
      },
      `⚡ Saiyan mode completed with strategy: ${strategy}`
    );
  }
  
  /**
   * Run SuperSaiyan mode (batch task execution)
   */
  async runSuperSaiyan(source?: string): Promise<any> {
    return executeWithRetryAndLogs(
      async () => {
        const superSaiyan = new SuperSaiyan();
        const result = await superSaiyan.runSuperSaiyan(source);
        return result;
      },
      '⚡ SuperSaiyan batch completed'
    );
  }
}
