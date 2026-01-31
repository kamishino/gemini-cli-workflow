const fs = require("fs-extra");
const path = require("upath");
const chalk = require("chalk");
const os = require("os");
const { EnvironmentManager } = require("../logic/env-manager");

async function main() {
  try {
    const projectRoot = path.resolve(__dirname, "../../");
    const envManager = new EnvironmentManager(projectRoot);
    const workspaceRoot = await envManager.getAbsoluteWorkspacePath();

    const ROADMAP_PATH = path.join(workspaceRoot, "ROADMAP.md");
    const TASKS_DIR = path.join(workspaceRoot, "tasks");
    const ARCHIVE_DIR = path.join(workspaceRoot, "archive");
    const CONTEXT_PATH = path.join(workspaceRoot, "PROJECT_CONTEXT.md");

    console.log(chalk.blue("ℹ️ Generating Strategic RoadMap..."));

    // 1. Get Context
    const contextContent = await fs.readFile(CONTEXT_PATH, "utf8");
    const phaseMatch = contextContent.match(/Current Phase:\s*(.*)/);
    const activeTaskMatch = contextContent.match(/Last Completed Action:\s*(.*)/);

    const currentPhase = phaseMatch ? phaseMatch[1].trim() : "Unknown";
    const lastAction = activeTaskMatch ? activeTaskMatch[1].trim() : "N/A";

    // 2. Get Device Info
    const hostname = os.hostname();
    const dateStr = new Date().toISOString().split("T")[0];

    // 3. Scan Achievements (Mock extraction, will be filled by AI in prompt context)
    // For now, we maintain the structure and let the AI fill the content via prompt

    let roadmapContent = `# 🗺️ Strategic RoadMap: KamiFlow Project\n\n`;
    roadmapContent += `> **PO Note:** This roadmap is a living document maintained by the Universal Roadmap Engine.\n`;
    roadmapContent += `> **Device Context:** ${hostname} | **Data Freshness:** ${dateStr}\n\n`;
    roadmapContent += `---\n\n`;
    roadmapContent += `## 🏁 Strategic Achievements (Value Delivered)\n`;
    roadmapContent += `*This section is updated automatically after every Sync/SuperLazy session.*\n\n`;
    roadmapContent += `{{ACHIEVEMENTS}}\n\n`;
    roadmapContent += `---\n\n`;
    roadmapContent += `## 🏗️ Current Focus (Active Pillars)\n`;
    roadmapContent += `- **Phase ${currentPhase}**\n`;
    roadmapContent += `- **Status:** ${lastAction}\n\n`;
    roadmapContent += `---\n\n`;
    roadmapContent += `## 🚀 AI-Suggested Growth Levers (Profit-Driven)\n`;
    roadmapContent += `{{GROWTH_LEVERS}}\n\n`;
    roadmapContent += `---\n\n`;
    roadmapContent += `## � v2.0 Quality Metrics\n\n`;
    roadmapContent += `*Auto-tracked by validation loop and reflection reports:*\n\n`;
    roadmapContent += `- **Validation Pass Rate:** {{VALIDATION_PASS_RATE}} (Target: >90%)\n`;
    roadmapContent += `- **Hallucination Incidents:** {{HALLUCINATION_COUNT}} (Target: <5%)\n`;
    roadmapContent += `- **Error Auto-Resolution:** {{AUTO_HEAL_RATE}} (Target: >80%)\n`;
    roadmapContent += `- **Technical Debt Score:** {{TECH_DEBT_SCORE}}\n`;
    roadmapContent += `- **Checkpoint Resumes:** {{CHECKPOINT_RESUMES}}\n\n`;
    roadmapContent += `---\n\n`;
    roadmapContent += `## �📅 Timeline & Detailed Progress\n\n`;
    roadmapContent += `### ✅ Completed\n`;
    roadmapContent += `- [x] **v1.0 Core:** Initial setup.\n`;

    // Scan Archive for completed tasks
    if (fs.existsSync(ARCHIVE_DIR)) {
      const folders = fs.readdirSync(ARCHIVE_DIR).sort().reverse();
      folders.slice(0, 10).forEach((f) => {
        roadmapContent += `- [x] **Archived:** ${f}\n`;
      });
    }

    roadmapContent += `\n### 🚧 In Progress\n`;
    if (fs.existsSync(TASKS_DIR)) {
      const activeTasks = fs.readdirSync(TASKS_DIR).filter((f) => f.endsWith(".md"));
      activeTasks.forEach((t) => {
        roadmapContent += `- [ ] **Active:** ${t}\n`;
      });
    }

    roadmapContent += `\n### 📋 Backlog (Planned)\n`;
    roadmapContent += `- [ ] Ecosystem expansion.\n`;
    roadmapContent += `- [ ] Automated release manager.\n\n`;
    roadmapContent += `---\n\n`;
    roadmapContent += `## 📈 Success Metrics\n`;
    roadmapContent += `- **Stability:** Rock-solid execution.\n`;
    roadmapContent += `- **Efficiency:** Strategic alignment.\n`;

    await fs.writeFile(ROADMAP_PATH, roadmapContent);
    console.log(chalk.green(`✅ RoadMap updated successfully at: ${ROADMAP_PATH}`));
  } catch (error) {
    console.error(chalk.red(`❌ Roadmap Generation Error: ${error.message}`));
    process.exit(1);
  }
}

main();
