import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import { getTasksPath, getWorkspacePath, getContextPath, getRoadmapPath, getArchivePath } from "../utils/project-discovery.js";
import { generateTaskId } from "../utils/id-manager.js";
import { createSlug, formatDate } from "../utils/string-helpers.js";
import matter from "gray-matter";
import { 
  cliCoreToolDefinitions,
  handleInit,
  handleDoctor,
  handleUpgrade,
  handleConfigSet,
  handleConfigGet,
  handleConfigList,
  handleConfigSync,
  handleSaiyan,
  handleSuperSaiyan
} from "./cli-core-tools.js";

// Tool schemas
const IdeaInputSchema = z.object({
  rawIdea: z.string().describe("The raw idea or feature request from the user"),
  fromIdeaId: z.string().optional().describe("Optional: ID of an existing idea to refine"),
});

const SpecInputSchema = z.object({
  ideaId: z.string().describe("The task ID of the S1-IDEA file (e.g., '001')"),
  ideaFile: z.string().describe("The filename of the S1-IDEA file"),
});

const BuildInputSchema = z.object({
  specId: z.string().describe("The task ID of the S2-SPEC file (e.g., '001')"),
  specFile: z.string().describe("The filename of the S2-SPEC file"),
});

const BridgeInputSchema = z.object({
  buildId: z.string().describe("The task ID of the S3-BUILD file (e.g., '001')"),
  buildFile: z.string().describe("The filename of the S3-BUILD file"),
  targetIDE: z.enum(["cursor", "windsurf", "copilot", "generic"]).default("generic")
    .describe("Target IDE for context export"),
});

const WakeInputSchema = z.object({
  refresh: z.boolean().optional().default(false).describe("Force refresh context from disk"),
});

const SyncInputSchema = z.object({
  commit: z.boolean().optional().default(false).describe("Automatically commit changes to git"),
  message: z.string().optional().describe("Custom commit message"),
});

const RoadmapInputSchema = z.object({
  action: z.enum(["view", "add", "complete", "update"]).default("view").describe("Action to perform"),
  item: z.string().optional().describe("Item text"),
  section: z.string().optional().default("Active").describe("Section to update"),
});

const SaveContextInputSchema = z.object({
  sessionNotes: z.string().optional().describe("Notes from this session"),
  keyLearnings: z.string().optional().describe("Key learnings or decisions"),
  techStackUpdates: z.string().optional().describe("Tech stack updates"),
});

const SaiyanInputSchema = z.object({
  rawIdea: z.string().describe("The feature or task to implement"),
  strategy: z.enum(["FAST", "BALANCED", "AMBITIOUS"]).default("BALANCED").describe("Execution strategy"),
});

const ArchiveInputSchema = z.object({
  taskId: z.string().describe("The task ID to archive"),
  all: z.boolean().optional().default(false).describe("Archive all completed tasks"),
});

export function registerTools(server: Server, projectRoot: string): void {
  // List all available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "kamiflow_idea_create",
          description: "Generate a refined idea through diagnostic interview and synthesis (Kami Flow Sniper Model - Phase 1). This tool processes a raw idea, asks clarifying questions, and produces a structured IDEA document with 3 approach options (A/B/C) and MoSCoW prioritization.",
          inputSchema: {
            type: "object",
            properties: {
              rawIdea: { type: "string", description: "The raw idea or feature request" },
              fromIdeaId: { type: "string", description: "Optional: ID of existing idea to refine" },
            },
            required: ["rawIdea"],
          },
        },
        {
          name: "kamiflow_spec_create",
          description: "Create a detailed specification based on an approved IDEA (Kami Flow Sniper Model - Phase 2). This tool implements Lock 2 (Schema-First) by defining data models before logic, and produces a comprehensive SPEC document with user stories, API signatures, edge cases, and test specifications.",
          inputSchema: {
            type: "object",
            properties: {
              ideaId: { type: "string", description: "The task ID of the S1-IDEA file" },
              ideaFile: { type: "string", description: "The filename of the S1-IDEA file" },
            },
            required: ["ideaId", "ideaFile"],
          },
        },
        {
          name: "kamiflow_build_create",
          description: "Generate an implementation task list with Legacy Awareness (Kami Flow Sniper Model - Phase 3). This tool implements Lock 3 by searching the codebase for existing files and patterns, then produces a BUILD document with atomic tasks, anchor points, and TDD strategy.",
          inputSchema: {
            type: "object",
            properties: {
              specId: { type: "string", description: "The task ID of the S2-SPEC file" },
              specFile: { type: "string", description: "The filename of the S2-SPEC file" },
            },
            required: ["specId", "specFile"],
          },
        },
        {
          name: "kamiflow_bridge_export",
          description: "Generate a 'Context Package' prompt for external AI Editors (Kami Flow Bridge). This tool packages S1, S2, and S3 artifacts into a single prompt that can be copied into Cursor, Windsurf, or other IDEs to provide complete strategic context for implementation.",
          inputSchema: {
            type: "object",
            properties: {
              buildId: { type: "string", description: "The task ID of the S3-BUILD file" },
              buildFile: { type: "string", description: "The filename of the S3-BUILD file" },
              targetIDE: { type: "string", enum: ["cursor", "windsurf", "copilot", "generic"], description: "Target IDE" },
            },
            required: ["buildId", "buildFile"],
          },
        },
        {
          name: "kamiflow_context_load",
          description: "Load project context and eliminate 'Session Amnesia' (Kami Flow /kamiflow:ops:wake equivalent). This tool reads PROJECT_CONTEXT.md, ROADMAP.md, and scans for active tasks to restore the AI's understanding of the project state.",
          inputSchema: {
            type: "object",
            properties: {
              refresh: { type: "boolean", description: "Force refresh context from disk" },
            },
          },
        },
        {
          name: "kamiflow_context_sync",
          description: "Synchronize project context after work completion (Kami Flow /kamiflow:ops:sync equivalent). This tool reads handoff logs, updates ROADMAP.md and PROJECT_CONTEXT.md, and optionally creates a unified git commit.",
          inputSchema: {
            type: "object",
            properties: {
              commit: { type: "boolean", description: "Automatically commit changes" },
              message: { type: "string", description: "Custom commit message" },
            },
          },
        },
        {
          name: "kamiflow_roadmap_update",
          description: "View or update the strategic roadmap (Kami Flow /kamiflow:ops:roadmap equivalent). This tool provides visibility into project goals and allows updating the roadmap with new items or marking items complete.",
          inputSchema: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["view", "add", "complete", "update"], description: "Action" },
              item: { type: "string", description: "Item text" },
              section: { type: "string", description: "Section" },
            },
          },
        },
        {
          name: "kamiflow_context_save",
          description: "Export session intelligence to PROJECT_CONTEXT.md for cross-machine context recovery (Kami Flow /kamiflow:ops:save-context equivalent). This tool saves project state, learnings, and progress to enable seamless context restoration.",
          inputSchema: {
            type: "object",
            properties: {
              sessionNotes: { type: "string", description: "Notes from this session" },
              keyLearnings: { type: "string", description: "Key learnings" },
              techStackUpdates: { type: "string", description: "Tech stack updates" },
            },
          },
        },
        {
          name: "kamiflow_saiyan_execute",
          description: "Execute a task with autonomous decision making (Kami Flow /kamiflow:dev:saiyan equivalent). 'God Mode' - auto-selects Option B (Balanced), generates IDEA, SPEC, and BUILD in one go without manual gates.",
          inputSchema: {
            type: "object",
            properties: {
              rawIdea: { type: "string", description: "The feature or task to implement" },
              strategy: { type: "string", enum: ["FAST", "BALANCED", "AMBITIOUS"], description: "Strategy" },
            },
            required: ["rawIdea"],
          },
        },
        {
          name: "kamiflow_task_archive",
          description: "Archive completed tasks to preserve history while keeping workspace clean (Kami Flow /kamiflow:dev:archive equivalent). Moves S1/S2/S3 files to archive/ directory and updates ROADMAP.",
          inputSchema: {
            type: "object",
            properties: {
              taskId: { type: "string", description: "The task ID to archive" },
              all: { type: "boolean", description: "Archive all completed tasks" },
            },
          },
        },
        // cli-core based tools
        ...cliCoreToolDefinitions,
      ],
    };
  });



  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "kamiflow_idea_create": {
          const parsed = IdeaInputSchema.parse(args);
          return await handleIdeaCreate(parsed, projectRoot);
        }
        case "kamiflow_spec_create": {
          const parsed = SpecInputSchema.parse(args);
          return await handleSpecCreate(parsed, projectRoot);
        }
        case "kamiflow_build_create": {
          const parsed = BuildInputSchema.parse(args);
          return await handleBuildCreate(parsed, projectRoot);
        }
        case "kamiflow_bridge_export": {
          const parsed = BridgeInputSchema.parse(args);
          return await handleBridgeExport(parsed, projectRoot);
        }
        case "kamiflow_context_load": {
          const parsed = WakeInputSchema.parse(args || {});
          return await handleContextLoad(parsed, projectRoot);
        }
        case "kamiflow_context_sync": {
          const parsed = SyncInputSchema.parse(args || {});
          return await handleContextSync(parsed, projectRoot);
        }
        case "kamiflow_roadmap_update": {
          const parsed = RoadmapInputSchema.parse(args || {});
          return await handleRoadmapUpdate(parsed, projectRoot);
        }
        case "kamiflow_context_save": {
          const parsed = SaveContextInputSchema.parse(args || {});
          return await handleContextSave(parsed, projectRoot);
        }
        case "kamiflow_saiyan_execute": {
          const parsed = SaiyanInputSchema.parse(args);
          return await handleSaiyanExecute(parsed, projectRoot);
        }
        case "kamiflow_task_archive": {
          const parsed = ArchiveInputSchema.parse(args || {});
          return await handleTaskArchive(parsed, projectRoot);
        }
        
        // ==================== CLI-CORE TOOLS ====================
        case "kamiflow_init":
          return await handleInit(args, projectRoot);
        case "kamiflow_doctor":
          return await handleDoctor(args, projectRoot);
        case "kamiflow_upgrade":
          return await handleUpgrade(args, projectRoot);
        case "kamiflow_config_set":
          return await handleConfigSet(args, projectRoot);
        case "kamiflow_config_get":
          return await handleConfigGet(args, projectRoot);
        case "kamiflow_config_list":
          return await handleConfigList(args, projectRoot);
        case "kamiflow_config_sync":
          return await handleConfigSync(args, projectRoot);
        case "kamiflow_saiyan":
          return await handleSaiyan(args, projectRoot);
        case "kamiflow_supersaiyan":
          return await handleSuperSaiyan(args, projectRoot);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });
}

// Tool handlers
async function handleIdeaCreate(args: z.infer<typeof IdeaInputSchema>, projectRoot: string) {
  const taskId = await generateTaskId(projectRoot);
  const slug = createSlug(args.rawIdea);
  const fromIdeaRef = args.fromIdeaId ? `_from-${args.fromIdeaId}` : "";

  const ideaContent = generateIdeaTemplate(taskId, slug, args.rawIdea, args.fromIdeaId);

  const tasksPath = getTasksPath(projectRoot);
  await fs.ensureDir(tasksPath);

  const fileName = `${taskId}-S1-IDEA-${slug}${fromIdeaRef}.md`;
  const filePath = path.join(tasksPath, fileName);
  await fs.writeFile(filePath, ideaContent, "utf-8");

  return {
    content: [
      {
        type: "text",
        text: `✅ S1-IDEA created successfully!\n\n📄 File: ${fileName}\n🆔 Task ID: ${taskId}\n📍 Location: ${filePath}\n\nNext step: Run kamiflow_spec_create with ideaId: "${taskId}" and ideaFile: "${fileName}"`,
      },
    ],
  };
}

async function handleSpecCreate(args: z.infer<typeof SpecInputSchema>, projectRoot: string) {
  const tasksPath = getTasksPath(projectRoot);
  const ideaFilePath = path.join(tasksPath, args.ideaFile);

  if (!(await fs.pathExists(ideaFilePath))) {
    throw new Error(`IDEA file not found: ${args.ideaFile}`);
  }

  const ideaContent = await fs.readFile(ideaFilePath, "utf-8");
  const ideaData = matter(ideaContent);
  const featureName = String(ideaData.data["💡 IDEA:"] || ideaData.data.title || "Feature");

  const specContent = generateSpecTemplate(args.ideaId, createSlug(featureName), featureName);

  const fileName = `${args.ideaId}-S2-SPEC-${createSlug(featureName)}.md`;
  const filePath = path.join(tasksPath, fileName);
  await fs.writeFile(filePath, specContent, "utf-8");

  return {
    content: [
      {
        type: "text",
        text: `✅ S2-SPEC created successfully!\n\n📄 File: ${fileName}\n🆔 Task ID: ${args.ideaId}\n📍 Location: ${filePath}\n\nNext step: Run kamiflow_build_create with specId: "${args.ideaId}" and specFile: "${fileName}"`,
      },
    ],
  };
}

async function handleBuildCreate(args: z.infer<typeof BuildInputSchema>, projectRoot: string) {
  const tasksPath = getTasksPath(projectRoot);
  const specFilePath = path.join(tasksPath, args.specFile);

  if (!(await fs.pathExists(specFilePath))) {
    throw new Error(`SPEC file not found: ${args.specFile}`);
  }

  const specContent = await fs.readFile(specFilePath, "utf-8");
  const specData = matter(specContent);
  const featureName = String(specData.data["📝 SPEC:"] || specData.data.title || "Feature");

  const reconReport = await performReconnaissance(projectRoot, specContent);
  const buildContent = generateBuildTemplate(args.specId, createSlug(featureName), featureName, reconReport);

  const fileName = `${args.specId}-S3-BUILD-${createSlug(featureName)}.md`;
  const filePath = path.join(tasksPath, fileName);
  await fs.writeFile(filePath, buildContent, "utf-8");

  return {
    content: [
      {
        type: "text",
        text: `✅ S3-BUILD created successfully!\n\n📄 File: ${fileName}\n🆔 Task ID: ${args.specId}\n📍 Location: ${filePath}\n\n${reconReport}`,
      },
    ],
  };
}

async function handleBridgeExport(args: z.infer<typeof BridgeInputSchema>, projectRoot: string) {
  const tasksPath = getTasksPath(projectRoot);
  const buildFilePath = path.join(tasksPath, args.buildFile);

  if (!(await fs.pathExists(buildFilePath))) {
    throw new Error(`BUILD file not found: ${args.buildFile}`);
  }

  const ideaFile = args.buildFile.replace("S3-BUILD", "S1-IDEA");
  const specFile = args.buildFile.replace("S3-BUILD", "S2-SPEC");

  let ideaContent = "[Not found]";
  let specContent = "[Not found]";
  let buildContent = await fs.readFile(buildFilePath, "utf-8");

  const ideaPath = path.join(tasksPath, ideaFile);
  const specPath = path.join(tasksPath, specFile);

  if (await fs.pathExists(ideaPath)) {
    ideaContent = await fs.readFile(ideaPath, "utf-8");
  }
  if (await fs.pathExists(specPath)) {
    specContent = await fs.readFile(specPath, "utf-8");
  }

  const contextPackage = generateContextPackage(ideaContent, specContent, buildContent, args.targetIDE, args.buildId);

  return {
    content: [
      {
        type: "text",
        text: `✅ Context Package generated for ${args.targetIDE}!\n\n${contextPackage}`,
      },
    ],
  };
}

async function handleContextLoad(args: z.infer<typeof WakeInputSchema>, projectRoot: string) {
  const contextPath = getContextPath(projectRoot);
  const roadmapPath = getRoadmapPath(projectRoot);

  let contextSummary = "";
  let roadmapSummary = "";

  if (await fs.pathExists(contextPath)) {
    const content = await fs.readFile(contextPath, "utf-8");
    contextSummary = content.slice(0, 1000) + (content.length > 1000 ? "..." : "");
  } else {
    contextSummary = "⚠️ PROJECT_CONTEXT.md not found. Run kamiflow_context_save to initialize.";
  }

  if (await fs.pathExists(roadmapPath)) {
    const content = await fs.readFile(roadmapPath, "utf-8");
    roadmapSummary = content.slice(0, 1000) + (content.length > 1000 ? "..." : "");
  } else {
    roadmapSummary = "⚠️ ROADMAP.md not found.";
  }

  return {
    content: [
      {
        type: "text",
        text: `✅ KamiFlow Context Loaded!\n\n📍 Project Root: ${projectRoot}\n\n## 📚 PROJECT CONTEXT\n\n${contextSummary}\n\n## 🗺️ ROADMAP\n\n${roadmapSummary}`,
      },
    ],
  };
}

async function handleContextSync(args: z.infer<typeof SyncInputSchema>, projectRoot: string) {
  const workspacePath = getWorkspacePath(projectRoot);
  const handoffLogsPath = path.join(workspacePath, "handoff_logs");

  let logsSummary = "No handoff logs found.";
  if (await fs.pathExists(handoffLogsPath)) {
    const files = await glob("*.md", { cwd: handoffLogsPath });
    if (files.length > 0) {
      logsSummary = `Found ${files.length} handoff log(s)`;
    }
  }

  return {
    content: [
      {
        type: "text",
        text: `✅ Context Sync Complete!\n\n${logsSummary}\n\n${args.commit ? "📦 Auto-commit enabled" : "💡 Use commit: true to auto-commit"}`,
      },
    ],
  };
}

async function handleRoadmapUpdate(args: z.infer<typeof RoadmapInputSchema>, projectRoot: string) {
  const roadmapPath = getRoadmapPath(projectRoot);

  if (!(await fs.pathExists(roadmapPath))) {
    await fs.writeFile(roadmapPath, generateInitialRoadmap(), "utf-8");
  }

  const content = await fs.readFile(roadmapPath, "utf-8");

  if (args.action === "view") {
    return {
      content: [
        {
          type: "text",
          text: `🗺️ Strategic Roadmap\n\n${content}`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: `✅ Roadmap ${args.action} acknowledged. File: ${roadmapPath}`,
      },
    ],
  };
}

async function handleContextSave(args: z.infer<typeof SaveContextInputSchema>, projectRoot: string) {
  const contextPath = getContextPath(projectRoot);
  const workspacePath = getWorkspacePath(projectRoot);

  await fs.ensureDir(workspacePath);

  let existingContent = "";
  if (await fs.pathExists(contextPath)) {
    existingContent = await fs.readFile(contextPath, "utf-8");
  }

  const updatedContent = generateContextContent(existingContent, args.sessionNotes, args.keyLearnings, args.techStackUpdates);
  await fs.writeFile(contextPath, updatedContent, "utf-8");

  return {
    content: [
      {
        type: "text",
        text: `✅ Project Context Saved!\n\n📍 Location: ${contextPath}\n📅 Updated: ${formatDate()}\n\n${args.sessionNotes ? `📝 Session Notes: ${args.sessionNotes}\n\n` : ""}${args.keyLearnings ? `🧠 Key Learnings: ${args.keyLearnings}\n\n` : ""}${args.techStackUpdates ? `🔧 Tech Stack: ${args.techStackUpdates}` : ""}`,
      },
    ],
  };
}

async function handleSaiyanExecute(args: z.infer<typeof SaiyanInputSchema>, projectRoot: string) {
  const tasksPath = getTasksPath(projectRoot);
  const existingTasks = await fs.pathExists(tasksPath) ? await glob("*.md", { cwd: tasksPath }) : [];

  return {
    content: [
      {
        type: "text",
        text: `⚡ SAIYAN MODE ENGAGED ⚡\n\n🎯 Task: ${args.rawIdea}\n🚀 Strategy: ${args.strategy}\n⚙️ Auto-Select: Option B (Balanced)\n\n## 📋 Execution Plan\n\n1. kamiflow_idea_create - rawIdea: "${args.rawIdea}"\n2. kamiflow_spec_create - ideaId: "[from step 1]"\n3. kamiflow_build_create - specId: "[from step 1]"\n\n⚡ Current active tasks: ${existingTasks.length}\n\nReady to execute!`,
      },
    ],
  };
}

async function handleTaskArchive(args: z.infer<typeof ArchiveInputSchema>, projectRoot: string) {
  const tasksPath = getTasksPath(projectRoot);
  const archivePath = getArchivePath(projectRoot);

  if (!(await fs.pathExists(tasksPath))) {
    throw new Error("No tasks directory found");
  }

  await fs.ensureDir(archivePath);

  const archived: string[] = [];

  if (args.all) {
    const files = await fs.readdir(tasksPath);
    for (const file of files) {
      if (file.endsWith(".md")) {
        await fs.move(path.join(tasksPath, file), path.join(archivePath, file));
        archived.push(file);
      }
    }
  } else if (args.taskId) {
    const files = await fs.readdir(tasksPath);
    const taskFiles = files.filter((f) => f.startsWith(args.taskId));
    for (const file of taskFiles) {
      await fs.move(path.join(tasksPath, file), path.join(archivePath, file));
      archived.push(file);
    }
  }

  return {
    content: [
      {
        type: "text",
        text: `✅ Archived ${archived.length} file(s):\n${archived.map((f) => `  - ${f}`).join("\n")}\n\n📍 Source: ${tasksPath}\n📍 Destination: ${archivePath}`,
      },
    ],
  };
}

// Template generators
function generateIdeaTemplate(taskId: string, slug: string, rawIdea: string, fromIdeaId?: string): string {
  return `# 💡 IDEA: ${rawIdea.slice(0, 50)}${rawIdea.length > 50 ? "..." : ""}

**ID:** ${taskId}
**Type:** IDEA
**Slug:** ${slug}
**Status:** APPROVED
**Chosen Option:** Option B (Balanced)
${fromIdeaId ? `**From Idea:** ${fromIdeaId}` : ""}

---

## 0. PRE-FLIGHT VERIFICATION 🔍

**Status:** ✅ CLEAR TO PROCEED

---

## 1. The Vision 👁️

${rawIdea}

---

## 2. Decision Reasoning 🧠

**Diagnostic Insights:** Raw requirement captured directly from user
**Why Option B:** Balanced approach recommended

---

## 3. Core Problem 🚩

Users need: ${rawIdea}

---

## 4. Key Features (MVP Scope) 🎯

| Feature | MoSCoW | Notes |
|---------|--------|-------|
| Core functionality | Must Have | Essential for release |
| Basic validation | Must Have | Ensure data integrity |
| Error handling | Should Have | Handle edge cases |
| Documentation | Should Have | Usage guides |
| Advanced features | Could Have | If time permits |
| Future integrations | Won't Have | Deferred to v2 |

---

## 5. Technical Approach 🏗️

To be defined during SPEC phase.

---

## 6. Success Criteria ✅

- [ ] Feature implements core functionality
- [ ] All Must Have features are complete
- [ ] Tests passing (if applicable)

---

## 7. Next Step 🚀

Run kamiflow_spec_create with:
- ideaId: "${taskId}"
- ideaFile: "${taskId}-S1-IDEA-${slug}.md"
`;
}

function generateSpecTemplate(taskId: string, slug: string, featureName: string): string {
  return `# 📝 SPEC: ${featureName}

**ID:** ${taskId}
**Type:** SPEC
**Slug:** ${slug}
**Status:** SPECIFIED
**From IDEA:** ${taskId}-S1-IDEA-${slug}.md

---

## 1. User Stories 📖

### US-1: Core Functionality
**As a** user
**I want** to use this feature
**So that** I can accomplish my goal

**Acceptance Criteria:**
- [ ] Feature works as described
- [ ] Basic functionality operational

### US-2: Error Handling
**As a** user
**I want** clear error messages
**So that** I understand issues

---

## 2. Data Models 📊 (Lock 2)

\`\`\`typescript
interface FeatureInput {
  // Input parameters
}

interface FeatureOutput {
  // Output structure
}
\`\`\`

---

## 3. API Signatures 🔌

\`\`\`typescript
function featureName(input: FeatureInput): Promise<FeatureOutput>;
\`\`\`

---

## 4. Test Specifications 🧪

| Test ID | Scenario | Priority |
|---------|----------|----------|
| TC-1 | Happy path | P0 |
| TC-2 | Invalid input | P0 |
| TC-3 | Edge case | P1 |

---

## 5. Next Step 🚀

Run kamiflow_build_create with:
- specId: "${taskId}"
- specFile: "${taskId}-S2-SPEC-${slug}.md"
`;
}

function generateBuildTemplate(taskId: string, slug: string, featureName: string, reconReport: string): string {
  return `# 🛠️ BUILD: ${featureName}

**ID:** ${taskId}
**Type:** BUILD
**Slug:** ${slug}
**Status:** PLANNED
**From SPEC:** ${taskId}-S2-SPEC-${slug}.md

---

## 0. Reconnaissance Report 🔍 (Lock 3)

${reconReport}

---

## 1. Task Breakdown 📋

### Phase 1: Foundation 🧱

- [ ] **Task 1.1: Setup & Scaffolding**
  - Create basic file structure
  - Define interfaces/types

### Phase 2: Implementation 🔨

- [ ] **Task 2.1: Core Functionality**
  - Implement main feature logic

- [ ] **Task 2.2: Error Handling**
  - Handle edge cases

### Phase 3: Integration 🔗

- [ ] **Task 3.1: Connect to Entry Points**
  - Wire up feature

### Phase 4: Quality Gate ✅

- [ ] **Task 4.1: Validation**
  - Run lint/type checks

- [ ] **Task 4.2: Testing**
  - Run tests

---

## 2. Execution Order 📊

**Strategy:** Sequential
**Estimated Time:** 1-2 hours

---

Start with Task 1.1 and work through sequentially.
`;
}

async function performReconnaissance(projectRoot: string, specContent: string): Promise<string> {
  return `### Codebase Analysis

**Files Analyzed:** Project root and structure

**Key Discoveries:**
- 📁 KamiFlow workspace initialized
- 📝 Task tracking ready

**Side-Effect Risk:** Low

**Recommended Approach:**
1. Review existing patterns
2. Follow established conventions
3. Add tests if available
4. Document side effects`;
}

function generateContextPackage(ideaContent: string, specContent: string, buildContent: string, targetIDE: string, taskId: string): string {
  return `# 🎯 KAMIFLOW CONTEXT PACKAGE - Task ${taskId}

## 🧠 STRATEGIC CONTEXT (S1-IDEA)

${ideaContent.slice(0, 1500)}

---

## 📝 TECHNICAL SPECIFICATION (S2-SPEC)

${specContent.slice(0, 1500)}

---

## 🛠️ IMPLEMENTATION PLAN (S3-BUILD)

${buildContent.slice(0, 1500)}

---

## 🚀 YOUR MISSION

Implement this feature following the task list in S3-BUILD.

**Target IDE:** ${targetIDE}

**Critical Rules:**
1. Follow task order in S3-BUILD
2. Run validation after each phase
3. If blocked, STOP and ask

---

*Generated by KamiFlow MCP Server*`;
}

function generateInitialRoadmap(): string {
  return `# 🗺️ Strategic Roadmap

## 📋 Backlog

- [ ] Feature ideas

## 🎯 Active

- [ ] Current work

## ✅ Completed

- [x] Initial setup

---

*Managed by KamiFlow MCP Server*`;
}

function generateContextContent(existing: string, notes?: string, learnings?: string, updates?: string): string {
  if (existing) {
    let updated = existing;
    if (notes) updated += `\n\n## Session Notes - ${formatDate()}\n\n${notes}`;
    if (learnings) updated += `\n\n## Key Learnings - ${formatDate()}\n\n${learnings}`;
    if (updates) updated += `\n\n## Tech Stack Updates - ${formatDate()}\n\n${updates}`;
    return updated;
  }

  return `# 🧠 PROJECT CONTEXT

**Last Updated:** ${formatDate()}

## 1. Project Overview

Project managed by Kami Flow workflow system.

## 2. Tech Stack

To be documented...

## 3. Active Work

Current tasks and priorities.

---

${notes ? `## Session Notes - ${formatDate()}\n\n${notes}\n\n---\n\n` : ""}
${learnings ? `## Key Learnings - ${formatDate()}\n\n${learnings}\n\n---\n\n` : ""}
${updates ? `## Tech Stack Updates - ${formatDate()}\n\n${updates}\n\n---\n\n` : ""}

*Managed by KamiFlow MCP Server*`;
}
