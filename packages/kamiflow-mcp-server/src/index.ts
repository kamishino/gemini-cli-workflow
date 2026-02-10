#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { getProjectRoot } from "./utils/project-discovery.js";

async function main() {
  // Discover KamiFlow project
  const projectRoot = await getProjectRoot();
  
  if (!projectRoot) {
    console.error("❌ No KamiFlow project found. Run 'kami init' first.");
    process.exit(1);
  }

  console.error(`🔍 KamiFlow project found: ${projectRoot}`);

  // Create MCP server
  const server = new Server(
    {
      name: "kamiflow-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Register handlers
  registerTools(server, projectRoot);
  registerResources(server, projectRoot);

  // Setup stdio transport
  const transport = new StdioServerTransport();
  
  console.error("🚀 KamiFlow MCP Server starting...");
  console.error("   Ready to serve AI agents with structured workflows");
  
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
