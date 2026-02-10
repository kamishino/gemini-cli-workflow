/**
 * Project Registry Management
 * Manages ~/.kamiflow/projects.json
 */

import fs from "fs-extra";
import path from "path";
import os from "os";

const REGISTRY_DIR = path.join(os.homedir(), ".kamiflow");
const REGISTRY_PATH = path.join(REGISTRY_DIR, "projects.json");

export interface Project {
  name: string;
  alias: string;
  rootPath: string;  // Windows format: D:\Projects\app
  description?: string;
  createdAt: string;
  lastAccessed?: string;
}

export interface ProjectRegistry {
  version: string;
  projects: Project[];
  defaultProject?: string;
  settings?: {
    autoDetectCwd: boolean;
    askForPath: boolean;
  };
}

/**
 * Ensure registry directory exists
 */
export async function ensureRegistryDir(): Promise<void> {
  await fs.ensureDir(REGISTRY_DIR);
}

/**
 * Load project registry from disk
 */
export async function loadRegistry(): Promise<ProjectRegistry> {
  await ensureRegistryDir();
  
  if (!(await fs.pathExists(REGISTRY_PATH))) {
    // Create default registry
    const defaultRegistry: ProjectRegistry = {
      version: "1.0",
      projects: [],
      settings: {
        autoDetectCwd: true,
        askForPath: true,
      },
    };
    await saveRegistry(defaultRegistry);
    return defaultRegistry;
  }
  
  const content = await fs.readFile(REGISTRY_PATH, "utf-8");
  return JSON.parse(content);
}

/**
 * Save project registry to disk
 */
export async function saveRegistry(registry: ProjectRegistry): Promise<void> {
  await ensureRegistryDir();
  await fs.writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf-8");
}

/**
 * Add a new project to registry
 */
export async function addProject(
  name: string,
  rootPath: string,
  alias?: string,
  description?: string
): Promise<Project> {
  const registry = await loadRegistry();
  
  // Generate alias if not provided
  const projectAlias = alias || generateAlias(name);
  
  // Check for duplicate alias
  if (registry.projects.some((p) => p.alias === projectAlias)) {
    throw new Error(`Project alias '${projectAlias}' already exists`);
  }
  
  // Normalize Windows path
  const normalizedPath = path.normalize(rootPath);
  
  const project: Project = {
    name,
    alias: projectAlias,
    rootPath: normalizedPath,
    description,
    createdAt: new Date().toISOString(),
  };
  
  registry.projects.push(project);
  
  // Set as default if first project
  if (registry.projects.length === 1) {
    registry.defaultProject = projectAlias;
  }
  
  await saveRegistry(registry);
  return project;
}

/**
 * Remove a project from registry
 */
export async function removeProject(alias: string): Promise<void> {
  const registry = await loadRegistry();
  
  const index = registry.projects.findIndex((p) => p.alias === alias);
  if (index === -1) {
    throw new Error(`Project '${alias}' not found`);
  }
  
  registry.projects.splice(index, 1);
  
  // Update default if removed
  if (registry.defaultProject === alias) {
    registry.defaultProject = registry.projects[0]?.alias;
  }
  
  await saveRegistry(registry);
}

/**
 * Get project by alias
 */
export async function getProjectByAlias(alias: string): Promise<Project | null> {
  const registry = await loadRegistry();
  return registry.projects.find((p) => p.alias === alias) || null;
}

/**
 * Get project by name (fuzzy match)
 */
export async function getProjectByName(name: string): Promise<Project | null> {
  const registry = await loadRegistry();
  
  // Exact match first
  const exact = registry.projects.find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  if (exact) return exact;
  
  // Partial match
  return (
    registry.projects.find((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    ) || null
  );
}

/**
 * Get default project
 */
export async function getDefaultProject(): Promise<Project | null> {
  const registry = await loadRegistry();
  if (!registry.defaultProject) return null;
  return getProjectByAlias(registry.defaultProject);
}

/**
 * Set default project
 */
export async function setDefaultProject(alias: string): Promise<void> {
  const registry = await loadRegistry();
  
  if (!registry.projects.some((p) => p.alias === alias)) {
    throw new Error(`Project '${alias}' not found`);
  }
  
  registry.defaultProject = alias;
  await saveRegistry(registry);
}

/**
 * List all projects
 */
export async function listProjects(): Promise<Project[]> {
  const registry = await loadRegistry();
  return registry.projects;
}

/**
 * Update last accessed timestamp
 */
export async function updateLastAccessed(alias: string): Promise<void> {
  const registry = await loadRegistry();
  
  const project = registry.projects.find((p) => p.alias === alias);
  if (project) {
    project.lastAccessed = new Date().toISOString();
    await saveRegistry(registry);
  }
}

/**
 * Resolve project from input
 * Priority: alias > name > default > ask
 */
export async function resolveProject(
  input?: string,
  cwd?: string
): Promise<{ project: Project; source: string }> {
  const registry = await loadRegistry();
  
  // 1. Try input as alias
  if (input) {
    const byAlias = await getProjectByAlias(input);
    if (byAlias) {
      await updateLastAccessed(byAlias.alias);
      return { project: byAlias, source: "alias" };
    }
    
    // 2. Try input as name
    const byName = await getProjectByName(input);
    if (byName) {
      await updateLastAccessed(byName.alias);
      return { project: byName, source: "name" };
    }
    
    // 3. Try input as path (absolute)
    if (await fs.pathExists(input)) {
      // Check if this path matches any registered project
      const normalized = path.normalize(input);
      const byPath = registry.projects.find(
        (p) => path.normalize(p.rootPath) === normalized
      );
      if (byPath) {
        await updateLastAccessed(byPath.alias);
        return { project: byPath, source: "path" };
      }
    }
  }
  
  // 4. Try CWD auto-detection
  if (registry.settings?.autoDetectCwd !== false && cwd) {
    const byCwd = await findProjectByCwd(cwd, registry);
    if (byCwd) {
      await updateLastAccessed(byCwd.alias);
      return { project: byCwd, source: "cwd" };
    }
  }
  
  // 5. Use default project
  const defaultProject = await getDefaultProject();
  if (defaultProject) {
    await updateLastAccessed(defaultProject.alias);
    return { project: defaultProject, source: "default" };
  }
  
  // 6. Ask for path (if enabled)
  if (registry.settings?.askForPath !== false) {
    throw new Error(
      "No project found. Please provide a project path or register a project first.\n" +
        "Use: kamiflow_project add <name> <path>"
    );
  }
  
  throw new Error("No project found and auto-detection is disabled");
}

/**
 * Find project by current working directory
 * Walks up the directory tree looking for .kamiflow/
 */
async function findProjectByCwd(
  cwd: string,
  registry: ProjectRegistry
): Promise<Project | null> {
  let currentDir = path.resolve(cwd);
  
  // Walk up directory tree
  for (let i = 0; i < 10; i++) {
    // Check if .kamiflow exists here
    const kamiflowDir = path.join(currentDir, ".kamiflow");
    if (await fs.pathExists(kamiflowDir)) {
      // Find matching project in registry
      const normalized = path.normalize(currentDir);
      const project = registry.projects.find(
        (p) => path.normalize(p.rootPath) === normalized
      );
      if (project) return project;
      
      // Not in registry, but has .kamiflow - could be unregistered project
      // Return a temporary project object
      return {
        name: path.basename(currentDir),
        alias: "current",
        rootPath: currentDir,
        createdAt: new Date().toISOString(),
      };
    }
    
    // Go up one level
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  
  return null;
}

/**
 * Generate alias from name
 */
function generateAlias(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 20);
}

/**
 * Get registry path (for external use)
 */
export function getRegistryPath(): string {
  return REGISTRY_PATH;
}
