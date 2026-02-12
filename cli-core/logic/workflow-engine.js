const fs = require('fs-extra');
const path = require('upath');
const chalk = require('chalk');
const { EnvironmentManager } = require('./env-manager');
const { WorkspaceIndex } = require('./workspace-index');

/**
 * WorkflowEngine - The orchestrator for the Sniper Model lifecycle.
 * Manages task states, enforces hard gates, and handles project-aware file creation.
 */
class WorkflowEngine {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.envManager = new EnvironmentManager(projectRoot);
    this.index = new WorkspaceIndex(projectRoot);
  }

  /**
   * Initialize a new task or load existing state
   */
  async getTaskState(taskId) {
    await this.index.initialize();
    const result = this.index.db.exec(
      "SELECT * FROM workflow_states WHERE task_id = ?",
      [taskId]
    )[0];

    if (!result || result.values.length === 0) {
      return null;
    }

    const row = result.values[0];
    const columns = result.columns;
    const state = {};
    columns.forEach((col, idx) => {
      state[col] = row[idx];
    });

    return {
      taskId: state.task_id,
      slug: state.slug,
      currentPhase: state.current_phase,
      clarifyScore: state.clarify_score,
      metadata: state.metadata ? JSON.parse(state.metadata) : {},
      updatedAt: state.updated_at
    };
  }

  /**
   * Save an artifact and update task state
   * Enforces Hard Gates (Score >= 8.0)
   */
  async saveArtifact(params) {
    const { taskId, phase, slug, content, score, metadata = {} } = params;
    
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
    const phaseType = phase === 'HANDOFF' ? 'HANDOFF' : phase;
    const fileName = `${taskId}-${phase}-${slug}.md`;
    const filePath = path.join(tasksDir, fileName);

    // 3. Physical Write
    await fs.writeFile(filePath, content);

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
