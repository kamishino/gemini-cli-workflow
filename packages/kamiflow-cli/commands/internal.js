/* eslint-disable no-process-exit */
/**
 * Internal (hidden) commands: _idea-*, _rules-update, _agent-scan, _recall, _insights, _workflow
 * These are used by Gemini CLI / AI agents and not exposed to users.
 */
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("upath");

module.exports = function register(program, execute) {
  // Idea Sandbox Logic
  program
    .command("_idea-create <title>", { hidden: true })
    .description("Internal: Create a new idea draft (used by Gemini CLI)")
    .option("-c, --content <content>", "Full content of the idea")
    .option("-s, --slug <slug>", "Summarized slug for filename")
    .option("-t, --type <type>", "Idea type: draft or discovery", "draft")
    .action(async (title, options) => {
      await execute(null, async () => {
        const { createIdea } = require("../logic/idea-manager");
        await createIdea(title, options.content, options.slug, options.type);
      });
    });

  program
    .command("_idea-refine <path> <content>", { hidden: true })
    .description(
      "Internal: Prepend a refinement to an idea (used by Gemini CLI)",
    )
    .action(async (filePath, content) => {
      await execute(null, async () => {
        const { prependRefinement } = require("../logic/idea-manager");
        await prependRefinement(filePath, content);
      });
    });

  program
    .command("_idea-promote <path>", { hidden: true })
    .description("Internal: Promote an idea draft (used by Gemini CLI)")
    .option("-f, --force", "Bypass quality gate")
    .action(async (filePath, options) => {
      await execute(null, async () => {
        const { promoteIdea } = require("../logic/idea-manager");
        await promoteIdea(filePath, options);
      });
    });

  program
    .command("_idea-analyze <path> <scoresJson>", { hidden: true })
    .description("Internal: Update idea scores (used by Gemini CLI)")
    .action(async (filePath, scoresJson) => {
      await execute(null, async () => {
        const { analyzeIdea } = require("../logic/idea-manager");
        const scores = JSON.parse(scoresJson);
        await analyzeIdea(filePath, scores);
      });
    });

  // Agent Management Logic
  program
    .command("_agent-scan", { hidden: true })
    .description("Internal: Scan for active AI agents in the project")
    .action(async () => {
      await execute(null, async () => {
        const { scanActiveAgents } = require("../logic/agent-manager");
        await scanActiveAgents();
      });
    });

  program
    .command("_rules-update <skillName> <link>", { hidden: true })
    .description("Internal: Update the central rules template with a new skill")
    .action(async (skillName, link) => {
      await execute(null, async () => {
        const { updateCentralTemplate } = require("../logic/agent-manager");
        await updateCentralTemplate(skillName, link);
      });
    });

  // Memory recall
  program
    .command("_recall <query>", { hidden: true })
    .description(
      "Internal: Generate summarized memory recall from archive (used by Gemini CLI)",
    )
    .option(
      "-c, --category <category>",
      "Context category for synonym expansion",
      "logic",
    )
    .action(async (query, options) => {
      await execute(null, async () => {
        const { MemoryManager } = require("../logic/memory-manager");
        const memoryManager = new MemoryManager(process.cwd());
        const recall = await memoryManager.generateRecall(query, options);
        console.log(recall);
      });
    });

  // Insights
  program
    .command("_insights", { hidden: true })
    .description(
      "Internal: Display categorized strategic patterns from Memory Bank",
    )
    .option("-c, --category <category>", "Filter by category")
    .option("-t, --task <taskId>", "Show knowledge graph for a specific task")
    .option(
      "-v, --visualize",
      "Generate Mermaid diagram for task relationships",
    )
    .option("-e, --export", "Export full knowledge graph to interactive HTML")
    .action(async (options) => {
      const InsightManager = require("../logic/insight-manager");
      const insightManager = new InsightManager(process.cwd());

      if (options.export) {
        try {
          const filePath = await insightManager.exportHTMLGraph();
          console.log(
            chalk.green(`\n✨ Knowledge Graph exported to: ${filePath}`),
          );
          console.log(
            chalk.gray(
              `   Open this file in your browser to explore the interactive map.\n`,
            ),
          );
        } catch (error) {
          console.error(chalk.red(`\n❌ Export failed: ${error.message}\n`));
        }
        return;
      }

      if (options.task) {
        await insightManager.displayGraph(options.task, {
          visualize: options.visualize,
        });
        return;
      }

      const { EnvironmentManager } = require("../logic/env-manager");
      const env = new EnvironmentManager();
      const workspaceRoot = await env.getAbsoluteWorkspacePath();
      const contextPath = path.join(workspaceRoot, "PROJECT_CONTEXT.md");

      if (!fs.existsSync(contextPath)) {
        console.log("❌ Memory Bank not found.");
        return;
      }

      const content = await fs.readFile(contextPath, "utf8");
      const header = "## 📚 Project Wisdom: Strategic Patterns";
      if (!content.includes(header)) {
        console.log("💭 No strategic patterns harvested yet.");
        return;
      }

      const wisdomSection = content.split(header)[1];
      if (options.category) {
        const categoryHeader = `### #${options.category}`;
        if (!wisdomSection.includes(categoryHeader)) {
          console.log(`💭 No patterns found for category #${options.category}`);
          return;
        }
        const categoryContent = wisdomSection
          .split(categoryHeader)[1]
          .split("###")[0];
        console.log(
          `# 📚 Project Wisdom: #${options.category}\n${categoryContent.trim()}`,
        );
      } else {
        console.log(
          `# 📚 Project Wisdom: Strategic Patterns\n${wisdomSection.trim()}`,
        );
      }
    });

  // Workflow engine
  program
    .command("_workflow", { hidden: true })
    .description("Internal: Manage Sniper Model workflow state and artifacts")
    .option("--init <taskId>", "Initialize a new task state")
    .option("--slug <slug>", "Slug for the task")
    .option(
      "--save <phase>",
      "Save an artifact for a specific phase (IDEA, SPEC, BUILD, HANDOFF)",
    )
    .option("--content <content>", "Markdown content of the artifact")
    .option("--score <score>", "Clarify Score for this task")
    .option("--status <taskId>", "Get the current status of a task")
    .option("--register-only", "Register artifact in DB without writing file")
    .action(async (options) => {
      const WorkflowEngine = require("../logic/workflow-engine");
      const engine = new WorkflowEngine(process.cwd());

      try {
        if (options.init) {
          const result = await engine.initTask(
            options.init,
            options.slug || "new-task",
          );
          console.log(JSON.stringify(result));
        } else if (options.save) {
          const parts = options.save.split("-");
          const taskId = parts.length > 1 ? parts[0] : options.init;
          const phase = parts.length > 1 ? parts[1] : options.save;

          const result = await engine.saveArtifact({
            taskId: taskId,
            phase: phase,
            slug: options.slug,
            content: options.content,
            score: parseFloat(options.score || "0"),
            registerOnly: options.registerOnly,
          });
          console.log(chalk.green(`✅ Artifact registered: ${result.path}`));
        } else if (options.status) {
          const state = await engine.getTaskState(options.status);
          if (state) {
            console.log(JSON.stringify(state, null, 2));
          } else {
            console.log(chalk.yellow(`Task ${options.status} not found.`));
          }
        }
      } catch (error) {
        console.error(chalk.red(`❌ Workflow Error: ${error.message}`));
        process.exit(1);
      }
    });
};
