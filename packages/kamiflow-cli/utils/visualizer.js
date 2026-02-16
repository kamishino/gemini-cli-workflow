const fs = require("fs-extra");
const path = require("upath");

/**
 * Visualizer Utility: Manages in-place Mermaid graph updates for SPEC/BUILD files.
 */
class Visualizer {
  /**
   * Updates the state of a specific node in a Mermaid graph within a Markdown file.
   * @param {string} filePath - Absolute path to the .md file.
   * @param {string} nodeId - The ID of the node to update.
   * @param {string} state - 'active' | 'done' | 'fail'.
   * @param {string} agentId - (Optional) The ID of the agent performing the task.
   */
  static async updateNodeState(filePath, nodeId, state, agentId = null) {
    if (!(await fs.pathExists(filePath))) return;

    let content = await fs.readFile(filePath, "utf8");
    const mermaidRegex = /```mermaid([\s\S]*?)```/g;

    const updatedContent = content.replace(mermaidRegex, (match, graphBody) => {
      // 1. Ensure class definitions exist in the graph
      let newGraphBody = graphBody.trim();
      if (!newGraphBody.includes("classDef active")) {
        newGraphBody += `\n    classDef active fill:#2196F3,stroke:#1565C0,color:#fff,stroke-width:3px;`;
        newGraphBody += `\n    classDef done fill:#4CAF50,stroke:#2E7D32,color:#fff;`;
        newGraphBody += `\n    classDef fail fill:#F44336,stroke:#B71C1C,color:#fff;`;
      }

      // 2. Remove existing state class for this node
      const classLineRegex = new RegExp(
        `^\\s*class ${nodeId} (active|done|fail).*$`,
        "gm",
      );
      newGraphBody = newGraphBody.replace(classLineRegex, "");

      // 3. Add new state class
      newGraphBody += `\n    class ${nodeId} ${state};`;

      // 4. (Optional) Update label with Agent ID for Swarm awareness
      if (agentId && state === "active") {
        const labelRegex = new RegExp(`(${nodeId})\\[(.*?)\\]`, "g");
        if (labelRegex.test(newGraphBody)) {
          newGraphBody = newGraphBody.replace(
            labelRegex,
            `$1[$2 (${agentId})]`,
          );
        }
      }

      return `\`\`\`mermaid\n${newGraphBody.trim()}\n\`\`\``;
    });

    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent);
      return true;
    }
    return false;
  }
}

module.exports = Visualizer;
