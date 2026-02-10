import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import { getTasksPath, getArchivePath } from "./project-discovery.js";

/**
 * Generate next task ID based on existing tasks
 * Format: 3-digit number (001, 002, etc.)
 */
export async function generateTaskId(projectRoot: string): Promise<string> {
  const tasksPath = getTasksPath(projectRoot);
  const archivePath = getArchivePath(projectRoot);
  
  let maxId = 0;
  
  // Scan tasks directory
  if (await fs.pathExists(tasksPath)) {
    const taskFiles = await glob("*.md", { cwd: tasksPath });
    for (const file of taskFiles) {
      const match = file.match(/^(\d{3})/);
      if (match) {
        const id = parseInt(match[1], 10);
        if (id > maxId) maxId = id;
      }
    }
  }
  
  // Scan archive directory
  if (await fs.pathExists(archivePath)) {
    const archiveFiles = await glob("*.md", { cwd: archivePath });
    for (const file of archiveFiles) {
      const match = file.match(/^(\d{3})/);
      if (match) {
        const id = parseInt(match[1], 10);
        if (id > maxId) maxId = id;
      }
    }
  }
  
  // Generate next ID
  const nextId = maxId + 1;
  return nextId.toString().padStart(3, "0");
}

/**
 * Parse task ID from filename
 */
export function parseTaskId(filename: string): string | null {
  const match = filename.match(/^(\d{3})/);
  return match ? match[1] : null;
}
