const fs = require('fs-extra');
const path = require('upath');
const chalk = require('chalk');
const { EnvironmentManager } = require('./env-manager');
const { WorkspaceIndex } = require('./workspace-index');
const Chronicler = require('./chronicler');

/**
 * WorkflowEngine - The orchestrator for the Sniper Model lifecycle.
 * Manages task states, enforces hard gates, and handles project-aware file creation.
 */
class WorkflowEngine {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.envManager = new EnvironmentManager(projectRoot);
    this.index = new WorkspaceIndex(projectRoot);
    this.chronicler = new Chronicler(projectRoot);
  }

  /**
   * Initialize a new task or load existing state
   */
  async getTaskState(taskId) {
    await this.index.initialize();
    
    let state = null;

    if (this.index.isNative) {
      const row = this.index.db.prepare("SELECT * FROM workflow_states WHERE task_id = ?").get(taskId);
      if (row) {
        state = {
          taskId: row.task_id,
          slug: row.slug,
          currentPhase: row.current_phase,
          clarifyScore: row.clarify_score,
          metadata: row.metadata ? JSON.parse(row.metadata) : {},
          updatedAt: row.updated_at
        };
      }
    } else {
      const result = this.index.db.exec(
        "SELECT * FROM workflow_states WHERE task_id = ?",
        [taskId]
      )[0];

      if (result && result.values.length > 0) {
        const row = result.values[0];
        const columns = result.columns;
        const rawState = {};
        columns.forEach((col, idx) => {
          rawState[col] = row[idx];
        });

        state = {
          taskId: rawState.task_id,
          slug: rawState.slug,
          currentPhase: rawState.current_phase,
          clarifyScore: rawState.clarify_score,
          metadata: rawState.metadata ? JSON.parse(rawState.metadata) : {},
          updatedAt: rawState.updated_at
        };
      }
    }

    return state;
  }

    /**
     * Save an artifact and update task state
     * Enforces Hard Gates (Score >= 8.0)
     */
    async saveArtifact(params) {
      const { taskId, phase, slug, content, score, metadata = {}, registerOnly = false } = params;
  
      // 1. Threshold Check for Phase 2+
      if (phase !== 'IDEA' && score < 8.0) {
        throw new Error(`[Hard Gate] Confidence Score (${score}) is below the required 8.0 threshold. Please refine the IDEA phase.`);     
      }
  
      await this.index.initialize();
      const workspaceRoot = await this.envManager.getAbsoluteWorkspacePath();
      const tasksDir = path.join(workspaceRoot, 'tasks');
      await fs.ensureDir(tasksDir);
  
      // 2. Generate Canonical Filename
      // Format: [ID]-[Phase]-[Type]-[slug].md
      // Map phase to artifact type
      let phaseType = phase; 
      let prefix = phase; 
  
      if (phase === 'IDEA') { phaseType = 'IDEA'; prefix = 'S1'; }
      else if (phase === 'SPEC') { phaseType = 'SPEC'; prefix = 'S2'; }
      else if (phase === 'BUILD') { phaseType = 'BUILD'; prefix = 'S3'; }
      else if (phase === 'HANDOFF') { phaseType = 'HANDOFF'; prefix = 'S4'; }
  
      const fileName = `${taskId}-${prefix}-${phaseType}-${slug}.md`;
      const filePath = path.join(tasksDir, fileName);
  
      // 3. Physical Write (Only if content provided and not register-only)
      if (!registerOnly && content) {
        await fs.writeFile(filePath, content);
      } else if (!await fs.pathExists(filePath)) {
         // If registering but file missing, warn but allow (maybe created manually)
         const logger = require('../utils/logger'); // Ensure logger is available
         // logger.warn(`[WorkflowEngine] Registering artifact but file not found: ${fileName}`);
      }
  
      // 4. Persistence in SQLite
      const currentMetadata = await this.getTaskState(taskId).then(s => s?.metadata || {});
      const updatedMetadata = { ...currentMetadata, ...metadata };
      updatedMetadata.artifacts = updatedMetadata.artifacts || {};
      updatedMetadata.artifacts[phase.toLowerCase()] = path.relative(this.projectRoot, filePath);
  
      const sql = `INSERT OR REPLACE INTO workflow_states (task_id, slug, current_phase, clarify_score, metadata, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?)`;
      const values = [taskId, slug, phase, score, JSON.stringify(updatedMetadata), Date.now()];
  
      if (this.index.isNative) {
        this.index.db.prepare(sql).run(...values);
      } else {
        this.index.db.run(sql, values);
      }
  
      await this.index.save();
  
      // Trigger Chronicler on Handoff (Completion)
      if (phase === 'HANDOFF') {
        this.chronicler.onTaskCompleted(taskId).catch(err => {
          const logger = require('../utils/logger');
          logger.debug(`[WorkflowEngine] Chronicler failed: ${err.message}`);
        });
      }
  
      return {
        success: true,
        path: path.relative(this.projectRoot, filePath),
        taskId,
        phase
      };
    }
  /**
   * Initialize a new task from a raw idea
   */
  async initTask(taskId, slug) {
    await this.index.initialize();
    const sql = `INSERT OR REPLACE INTO workflow_states (task_id, slug, current_phase, clarify_score, metadata, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [taskId, slug, 'START', 0, JSON.stringify({ artifacts: {} }), Date.now()];

    if (this.index.isNative) {
      this.index.db.prepare(sql).run(...values);
    } else {
      this.index.db.run(sql, values);
    }
    
    await this.index.save();
    return { taskId, slug, phase: 'START' };
  }
}

module.exports = WorkflowEngine;
