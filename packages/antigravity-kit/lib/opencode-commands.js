const fs = require("fs-extra");
const path = require("path");

const PLAN_WORKFLOWS = new Set([
  "brainstorm",
  "checkpoint",
  "compact",
  "eval",
  "research",
  "review",
  "wake",
]);

/**
 * Parse frontmatter + body from a workflow template
 * @param {string} content
 * @returns {{ description: string|null, body: string }}
 */
function parseWorkflowTemplate(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return { description: null, body: content };
  }

  const frontmatter = match[1];
  let body = content.slice(match[0].length);
  if (body.startsWith("\r\n")) {
    body = body.slice(2);
  } else if (body.startsWith("\n")) {
    body = body.slice(1);
  }

  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);
  const description = descriptionMatch ? descriptionMatch[1].trim() : null;

  return {
    description,
    body,
  };
}

/**
 * Resolve default OpenCode agent based on workflow name
 * @param {string} fileName
 * @returns {"build"|"plan"}
 */
function resolveOpenCodeAgent(fileName) {
  const workflowName = path.basename(fileName, path.extname(fileName));
  return PLAN_WORKFLOWS.has(workflowName) ? "plan" : "build";
}

/**
 * Escape a string to a safe, quoted YAML scalar.
 * @param {string} value
 * @returns {string}
 */
function toYamlString(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Build OpenCode command content from workflow metadata and body.
 * @param {{description: string|null, body: string, fileName: string, agent?: string}} input
 * @returns {string}
 */
function buildOpenCodeCommand(input) {
  const description = input.description || `AGK workflow: ${input.fileName}`;
  const agent = input.agent || resolveOpenCodeAgent(input.fileName);

  const lines = [
    "---",
    `description: ${toYamlString(description)}`,
    `agent: ${agent}`,
    "---",
    "$ARGUMENTS",
    "",
  ];

  let content = lines.join("\n") + input.body;
  if (!content.endsWith("\n")) {
    content += "\n";
  }

  return content;
}

/**
 * Load all workflow templates and render OpenCode command content.
 * @param {string} workflowsDir
 * @returns {Promise<Array<{fileName: string, description: string|null, agent: string, content: string}>>}
 */
async function loadOpenCodeCommandTemplates(workflowsDir) {
  if (!(await fs.pathExists(workflowsDir))) {
    return [];
  }

  const files = (await fs.readdir(workflowsDir))
    .filter((file) => file.endsWith(".md"))
    .sort();

  const templates = [];
  for (const fileName of files) {
    const workflowPath = path.join(workflowsDir, fileName);
    const source = await fs.readFile(workflowPath, "utf8");
    const parsed = parseWorkflowTemplate(source);
    const agent = resolveOpenCodeAgent(fileName);
    const content = buildOpenCodeCommand({
      fileName,
      description: parsed.description,
      body: parsed.body,
      agent,
    });

    templates.push({
      fileName,
      description: parsed.description,
      agent,
      content,
    });
  }

  return templates;
}

module.exports = {
  buildOpenCodeCommand,
  loadOpenCodeCommandTemplates,
  parseWorkflowTemplate,
  resolveOpenCodeAgent,
};
