/**
 * Additional MCP Tools using cli-core adapters
 * These tools wrap the cli-core functionality
 */

import { z } from "zod";
import { InstallerAdapter, ConfigAdapter, WorkflowAdapter } from "../adapters/index.js";
import cliCore from "@kamiflow/cli-core";
const { i18n } = cliCore;

// Force English for consistency (as requested) - lazy initialization
try {
  if (i18n && typeof i18n.setLanguage === 'function') {
    i18n.setLanguage("en");
  }
} catch (e) {
  // i18n not initialized yet, will use default
}

// Schemas for cli-core based tools
export const InitSchema = z.object({
  projectPath: z.string().optional().describe("Path to project (defaults to CWD)"),
  mode: z.enum(["link", "submodule", "standalone"]).default("link"),
  dev: z.boolean().default(false),
  skipInterview: z.boolean().default(false),
});

export const DoctorSchema = z.object({
  projectPath: z.string().optional().describe("Path to project"),
  fix: z.boolean().default(false),
  autoFix: z.boolean().default(false),
});

export const UpgradeSchema = z.object({
  projectPath: z.string().optional().describe("Path to project"),
  force: z.boolean().default(false),
});

export const ConfigSetSchema = z.object({
  projectPath: z.string().optional().describe("Path to project"),
  key: z.string().describe("Configuration key"),
  value: z.string().describe("Configuration value"),
  global: z.boolean().default(false).describe("Set globally"),
});

export const ConfigGetSchema = z.object({
  projectPath: z.string().optional().describe("Path to project"),
  key: z.string().describe("Configuration key"),
});

export const SaiyanSchema = z.object({
  projectPath: z.string().optional().describe("Path to project"),
  input: z.string().describe("Task description or input"),
  strategy: z.enum(["FAST", "BALANCED", "AMBITIOUS"]).default("BALANCED"),
});

export const SuperSaiyanSchema = z.object({
  projectPath: z.string().optional().describe("Path to project"),
  source: z.enum(["BACKLOG", "RESEARCH"]).optional(),
});

// Tool handlers
export async function handleInit(args: any, projectRoot: string) {
  const parsed = InitSchema.parse(args || {});
  const targetPath = parsed.projectPath || projectRoot;
  const adapter = new InstallerAdapter();
  const result = await adapter.init(targetPath, {
    mode: parsed.mode,
    dev: parsed.dev,
    skipInterview: parsed.skipInterview,
  });
  
  if (!result.success) {
    return {
      content: [{ type: "text" as const, text: `${result.message}\n\nLogs:\n${result.logs.join("\n")}` }],
      isError: true,
    };
  }
  
  return {
    content: [{ type: "text" as const, text: result.message }],
  };
}

export async function handleDoctor(args: any, projectRoot: string) {
  const parsed = DoctorSchema.parse(args || {});
  const targetPath = parsed.projectPath || projectRoot;
  const adapter = new InstallerAdapter();
  const result = await adapter.doctor(targetPath, {
    fix: parsed.fix,
    autoFix: parsed.autoFix,
  });
  
  if (!result.success) {
    return {
      content: [{ type: "text" as const, text: `${result.message}\n\nLogs:\n${result.logs.join("\n")}` }],
      isError: true,
    };
  }
  
  return {
    content: [{ type: "text" as const, text: `${result.message}\n\nResults: ${JSON.stringify(result.result, null, 2)}` }],
  };
}

export async function handleUpgrade(args: any, projectRoot: string) {
  const parsed = UpgradeSchema.parse(args || {});
  const targetPath = parsed.projectPath || projectRoot;
  const adapter = new InstallerAdapter();
  const result = await adapter.upgrade(targetPath, {
    force: parsed.force,
  });
  
  if (!result.success) {
    return {
      content: [{ type: "text" as const, text: `${result.message}\n\nLogs:\n${result.logs.join("\n")}` }],
      isError: true,
    };
  }
  
  return {
    content: [{ type: "text" as const, text: result.message }],
  };
}

export async function handleConfigSet(args: any, projectRoot: string) {
  const parsed = ConfigSetSchema.parse(args);
  const targetPath = parsed.projectPath || projectRoot;
  const adapter = new ConfigAdapter(targetPath);
  const result = await adapter.set(parsed.key, parsed.value, parsed.global);
  
  if (!result.success) {
    return {
      content: [{ type: "text" as const, text: `${result.message}\n\nLogs:\n${result.logs.join("\n")}` }],
      isError: true,
    };
  }
  
  return {
    content: [{ type: "text" as const, text: result.message }],
  };
}

export async function handleConfigGet(args: any, projectRoot: string) {
  const parsed = ConfigGetSchema.parse(args);
  const targetPath = parsed.projectPath || projectRoot;
  const adapter = new ConfigAdapter(targetPath);
  const result = await adapter.get(parsed.key);
  
  if (!result.success) {
    return {
      content: [{ type: "text" as const, text: `${result.message}\n\nLogs:\n${result.logs.join("\n")}` }],
      isError: true,
    };
  }
  
  return {
    content: [{ type: "text" as const, text: `${result.message}\n\nValue: ${result.result?.value || "Not set"}` }],
  };
}

export async function handleConfigList(args: any, projectRoot: string) {
  const parsed = args || {};
  const targetPath = parsed.projectPath || projectRoot;
  const adapter = new ConfigAdapter(targetPath);
  const result = await adapter.list();
  
  if (!result.success) {
    return {
      content: [{ type: "text" as const, text: `${result.message}\n\nLogs:\n${result.logs.join("\n")}` }],
      isError: true,
    };
  }
  
  return {
    content: [{ type: "text" as const, text: `${result.message}\n\nConfigs: ${JSON.stringify(result.result?.configs, null, 2)}` }],
  };
}

export async function handleConfigSync(args: any, projectRoot: string) {
  const parsed = args || {};
  const targetPath = parsed.projectPath || projectRoot;
  const adapter = new ConfigAdapter(targetPath);
  const result = await adapter.sync();
  
  if (!result.success) {
    return {
      content: [{ type: "text" as const, text: `${result.message}\n\nLogs:\n${result.logs.join("\n")}` }],
      isError: true,
    };
  }
  
  return {
    content: [{ type: "text" as const, text: `${result.message}\n\nReport: ${JSON.stringify(result.result, null, 2)}` }],
  };
}

export async function handleSaiyan(args: any, projectRoot: string) {
  const parsed = SaiyanSchema.parse(args);
  const targetPath = parsed.projectPath || projectRoot;
  const adapter = new WorkflowAdapter(targetPath);
  const result = await adapter.runSaiyan(parsed.input, parsed.strategy);
  
  if (!result.success) {
    return {
      content: [{ type: "text" as const, text: `${result.message}\n\nLogs:\n${result.logs.join("\n")}` }],
      isError: true,
    };
  }
  
  return {
    content: [{ type: "text" as const, text: `${result.message}\n\nResult: ${JSON.stringify(result.result, null, 2)}` }],
  };
}

export async function handleSuperSaiyan(args: any, projectRoot: string) {
  const parsed = SuperSaiyanSchema.parse(args || {});
  const targetPath = parsed.projectPath || projectRoot;
  const adapter = new WorkflowAdapter(targetPath);
  const result = await adapter.runSuperSaiyan(parsed.source);
  
  if (!result.success) {
    return {
      content: [{ type: "text" as const, text: `${result.message}\n\nLogs:\n${result.logs.join("\n")}` }],
      isError: true,
    };
  }
  
  return {
    content: [{ type: "text" as const, text: `${result.message}\n\nResult: ${JSON.stringify(result.result, null, 2)}` }],
  };
}

// Export tool definitions to be added to the main tools list
export const cliCoreToolDefinitions = [
  {
    name: "kamiflow_init",
    description: "Initialize KamiFlow in a project directory (kami init). Sets up .kamiflow/ folder, configuration, and templates.",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project (defaults to current directory)" },
        mode: { type: "string", enum: ["link", "submodule", "standalone"], description: "Integration mode" },
        dev: { type: "boolean", description: "Enable developer mode with symbolic links" },
        skipInterview: { type: "boolean", description: "Skip interactive questions" },
      },
    },
  },
  {
    name: "kamiflow_doctor",
    description: "Check system health and KamiFlow configuration (kami doctor). Detects and optionally fixes issues.",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project" },
        fix: { type: "boolean", description: "Attempt to automatically fix issues" },
        autoFix: { type: "boolean", description: "Bypass confirmation prompts during healing" },
      },
    },
  },
  {
    name: "kamiflow_upgrade",
    description: "Upgrade KamiFlow to the latest version (kami upgrade). Updates core files and dependencies.",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project" },
        force: { type: "boolean", description: "Force overwrite existing files" },
      },
    },
  },
  {
    name: "kamiflow_config_set",
    description: "Set a configuration value (kami config set). Updates local or global configuration.",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project" },
        key: { type: "string", description: "Configuration key" },
        value: { type: "string", description: "Configuration value" },
        global: { type: "boolean", description: "Set globally for all projects" },
      },
      required: ["key", "value"],
    },
  },
  {
    name: "kamiflow_config_get",
    description: "Get a configuration value (kami config get). Retrieves current setting.",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project" },
        key: { type: "string", description: "Configuration key" },
      },
      required: ["key"],
    },
  },
  {
    name: "kamiflow_config_list",
    description: "List all configuration values (kami config list). Shows local and global settings.",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project" },
      },
    },
  },
  {
    name: "kamiflow_config_sync",
    description: "Synchronize configuration with defaults (kami config sync). Adds missing keys and updates schema.",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project" },
      },
    },
  },
  {
    name: "kamiflow_saiyan",
    description: "Execute a task with autonomous decision making (kami saiyan). AI-driven workflow execution.",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project" },
        input: { type: "string", description: "Task description or input" },
        strategy: { type: "string", enum: ["FAST", "BALANCED", "AMBITIOUS"], description: "Execution strategy" },
      },
      required: ["input"],
    },
  },
  {
    name: "kamiflow_supersaiyan",
    description: "Execute a batch of tasks autonomously (kami supersaiyan). Batch processing mode.",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project" },
        source: { type: "string", enum: ["BACKLOG", "RESEARCH"], description: "Source of tasks" },
      },
    },
  },
];
