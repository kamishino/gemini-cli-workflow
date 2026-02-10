import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Discover KamiFlow project root by looking for .kamiflow directory
 * Search order:
 * 1. KAMIFLOW_PROJECT_ROOT env variable
 * 2. Current working directory
 * 3. Parent directories (up to 5 levels)
 * 4. Home directory ~/.kami-flow/
 */
export async function getProjectRoot(): Promise<string | null> {
  // 1. Check environment variable
  if (process.env.KAMIFLOW_PROJECT_ROOT) {
    const envPath = path.resolve(process.env.KAMIFLOW_PROJECT_ROOT);
    if (await isKamiFlowProject(envPath)) {
      return envPath;
    }
  }

  // 2. Check current working directory and parents
  let currentDir = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (await isKamiFlowProject(currentDir)) {
      return currentDir;
    }
    
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  // 3. Check home directory
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  if (homeDir) {
    const globalKamiDir = path.join(homeDir, ".kami-flow");
    if (await fs.pathExists(globalKamiDir)) {
      return globalKamiDir;
    }
  }

  return null;
}

/**
 * Check if a directory is a KamiFlow project
 */
async function isKamiFlowProject(dir: string): Promise<boolean> {
  const kamiflowDir = path.join(dir, ".kamiflow");
  return await fs.pathExists(kamiflowDir);
}

/**
 * Get the absolute path to KamiFlow workspace
 */
export function getWorkspacePath(projectRoot: string): string {
  return path.join(projectRoot, ".kamiflow");
}

/**
 * Get path to PROJECT_CONTEXT.md
 */
export function getContextPath(projectRoot: string): string {
  return path.join(getWorkspacePath(projectRoot), "PROJECT_CONTEXT.md");
}

/**
 * Get path to ROADMAP.md
 */
export function getRoadmapPath(projectRoot: string): string {
  return path.join(getWorkspacePath(projectRoot), "ROADMAP.md");
}

/**
 * Get path to tasks directory
 */
export function getTasksPath(projectRoot: string): string {
  return path.join(getWorkspacePath(projectRoot), "tasks");
}

/**
 * Get path to archive directory
 */
export function getArchivePath(projectRoot: string): string {
  return path.join(getWorkspacePath(projectRoot), "archive");
}
