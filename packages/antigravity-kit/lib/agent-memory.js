/**
 * lib/agent-memory.js — Per-agent learning system
 *
 * Each agent can accumulate lessons over time. Memory is stored in
 * .memory/agents/<agent-name>.md and auto-loaded by workflows.
 */

const fs = require("fs-extra");
const path = require("path");

const AGENTS_MEMORY_DIR = ".memory/agents";

/**
 * Get the memory file path for an agent.
 */
function getMemoryPath(projectDir, agentName) {
  return path.join(projectDir, AGENTS_MEMORY_DIR, `${agentName}.md`);
}

/**
 * Read an agent's memory. Returns empty string if no memory exists.
 */
async function readMemory(projectDir, agentName) {
  const memPath = getMemoryPath(projectDir, agentName);
  if (await fs.pathExists(memPath)) {
    return await fs.readFile(memPath, "utf8");
  }
  return "";
}

/**
 * Append a lesson to an agent's memory under a specific section.
 *
 * @param {string} projectDir
 * @param {string} agentName - e.g. "debugger", "architect"
 * @param {string} section - "Patterns Learned" | "Common Issues" | "Preferences"
 * @param {string} lesson - The lesson text to append
 */
async function appendLesson(projectDir, agentName, section, lesson) {
  const memPath = getMemoryPath(projectDir, agentName);
  await fs.ensureDir(path.dirname(memPath));

  const timestamp = new Date().toISOString().split("T")[0];
  const entry = `- [${timestamp}] ${lesson}`;

  if (!(await fs.pathExists(memPath))) {
    // Create from template
    const template = `# Agent Memory: ${agentName}\n\n## Patterns Learned\n\n## Common Issues\n\n## Preferences\n`;
    await fs.writeFile(memPath, template, "utf8");
  }

  let content = await fs.readFile(memPath, "utf8");

  // Find section and append after the section marker
  const sectionHeader = `## ${section}`;
  const sectionIdx = content.indexOf(sectionHeader);

  if (sectionIdx === -1) {
    // Section doesn't exist, add it
    content += `\n${sectionHeader}\n\n${entry}\n`;
  } else {
    // Find the next section or end of file
    const afterHeader = sectionIdx + sectionHeader.length;
    const nextSection = content.indexOf("\n## ", afterHeader);
    const insertPos = nextSection === -1 ? content.length : nextSection;

    // Insert before next section
    content =
      content.slice(0, insertPos).trimEnd() +
      "\n" +
      entry +
      "\n" +
      content.slice(insertPos);
  }

  await fs.writeFile(memPath, content.trimEnd() + "\n", "utf8");
}

/**
 * List all agents that have memory files.
 */
async function listAgentsWithMemory(projectDir) {
  const memDir = path.join(projectDir, AGENTS_MEMORY_DIR);
  if (!(await fs.pathExists(memDir))) return [];

  const files = (await fs.readdir(memDir)).filter((f) => f.endsWith(".md"));
  return files.map((f) => f.replace(".md", ""));
}

/**
 * Initialize memory files for all installed agents.
 */
async function initAllMemory(projectDir) {
  const agentsDir = path.join(projectDir, ".agent", "agents");
  if (!(await fs.pathExists(agentsDir))) return 0;

  const agents = (await fs.readdir(agentsDir))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(".md", ""));

  let created = 0;
  for (const agent of agents) {
    const memPath = getMemoryPath(projectDir, agent);
    if (!(await fs.pathExists(memPath))) {
      await fs.ensureDir(path.dirname(memPath));
      const template = `# Agent Memory: ${agent}\n\n## Patterns Learned\n\n## Common Issues\n\n## Preferences\n`;
      await fs.writeFile(memPath, template, "utf8");
      created++;
    }
  }

  return created;
}

module.exports = {
  readMemory,
  appendLesson,
  listAgentsWithMemory,
  initAllMemory,
  getMemoryPath,
};
