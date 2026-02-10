import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import matter from "gray-matter";
import { getContextPath, getRoadmapPath, getTasksPath, getArchivePath } from "../utils/project-discovery.js";
import { parseTaskId } from "../utils/id-manager.js";

export function registerResources(server: Server, projectRoot: string): void {
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: "kamiflow://project-context",
          name: "Project Context",
          description: "Current project state from PROJECT_CONTEXT.md",
          mimeType: "application/json",
        },
        {
          uri: "kamiflow://roadmap",
          name: "Strategic Roadmap",
          description: "Project roadmap from ROADMAP.md",
          mimeType: "application/json",
        },
        {
          uri: "kamiflow://tasks/active",
          name: "Active Tasks",
          description: "Active S1/S2/S3 task files",
          mimeType: "application/json",
        },
        {
          uri: "kamiflow://tasks/all",
          name: "All Tasks",
          description: "All tasks including completed",
          mimeType: "application/json",
        },
        {
          uri: "kamiflow://archive",
          name: "Archived Tasks",
          description: "Completed task history",
          mimeType: "application/json",
        },
      ],
    };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    try {
      if (uri === "kamiflow://project-context") {
        return await readProjectContext(projectRoot);
      } else if (uri === "kamiflow://roadmap") {
        return await readRoadmap(projectRoot);
      } else if (uri === "kamiflow://tasks/active" || uri === "kamiflow://tasks/all") {
        return await readTasks(projectRoot, uri.includes("active") ? "active" : "all");
      } else if (uri === "kamiflow://archive") {
        return await readArchive(projectRoot);
      } else {
        throw new Error(`Unknown resource: ${uri}`);
      }
    } catch (error) {
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ status: "error", message: String(error) }, null, 2),
        }],
      };
    }
  });
}

async function readProjectContext(projectRoot: string) {
  const contextPath = getContextPath(projectRoot);
  
  if (!(await fs.pathExists(contextPath))) {
    return {
      contents: [{
        uri: "kamiflow://project-context",
        mimeType: "application/json",
        text: JSON.stringify({ status: "not_initialized", message: "Run kamiflow_context_save first" }, null, 2),
      }],
    };
  }

  const content = await fs.readFile(contextPath, "utf-8");
  const data = matter(content);
  
  return {
    contents: [{
      uri: "kamiflow://project-context",
      mimeType: "application/json",
      text: JSON.stringify({ status: "loaded", metadata: data.data, content: data.content }, null, 2),
    }],
  };
}

async function readRoadmap(projectRoot: string) {
  const roadmapPath = getRoadmapPath(projectRoot);
  
  if (!(await fs.pathExists(roadmapPath))) {
    return {
      contents: [{
        uri: "kamiflow://roadmap",
        mimeType: "application/json",
        text: JSON.stringify({ status: "not_initialized", message: "Run kamiflow_roadmap_update first" }, null, 2),
      }],
    };
  }

  const content = await fs.readFile(roadmapPath, "utf-8");
  
  return {
    contents: [{
      uri: "kamiflow://roadmap",
      mimeType: "application/json",
      text: JSON.stringify({ status: "loaded", content }, null, 2),
    }],
  };
}

async function readTasks(projectRoot: string, filter: "active" | "all") {
  const tasksPath = getTasksPath(projectRoot);
  
  if (!(await fs.pathExists(tasksPath))) {
    return {
      contents: [{
        uri: `kamiflow://tasks/${filter}`,
        mimeType: "application/json",
        text: JSON.stringify({ status: "empty", tasks: [] }, null, 2),
      }],
    };
  }

  const files = await glob("*.md", { cwd: tasksPath });
  const filteredFiles = filter === "active" ? files.filter(f => f.includes("S1-IDEA")) : files;
  
  const tasks = await Promise.all(filteredFiles.map(async (filename) => {
    const filePath = path.join(tasksPath, filename);
    const content = await fs.readFile(filePath, "utf-8");
    const data = matter(content);
    const taskId = parseTaskId(filename);
    
    let phase = "unknown";
    if (filename.includes("S1-IDEA")) phase = "idea";
    else if (filename.includes("S2-SPEC")) phase = "spec";
    else if (filename.includes("S3-BUILD")) phase = "build";
    
    return {
      id: taskId,
      filename,
      phase,
      title: data.data.title || filename,
      status: data.data.Status || "unknown",
    };
  }));

  return {
    contents: [{
      uri: `kamiflow://tasks/${filter}`,
      mimeType: "application/json",
      text: JSON.stringify({ status: "loaded", count: tasks.length, tasks }, null, 2),
    }],
  };
}

async function readArchive(projectRoot: string) {
  const archivePath = getArchivePath(projectRoot);
  
  if (!(await fs.pathExists(archivePath))) {
    return {
      contents: [{
        uri: "kamiflow://archive",
        mimeType: "application/json",
        text: JSON.stringify({ status: "empty", tasks: [] }, null, 2),
      }],
    };
  }

  const files = await glob("*.md", { cwd: archivePath });
  
  const tasks = await Promise.all(files.map(async (filename) => {
    const filePath = path.join(archivePath, filename);
    const content = await fs.readFile(filePath, "utf-8");
    const data = matter(content);
    const taskId = parseTaskId(filename);
    
    return {
      id: taskId,
      filename,
      title: data.data.title || filename,
      archived: true,
    };
  }));

  return {
    contents: [{
      uri: "kamiflow://archive",
      mimeType: "application/json",
      text: JSON.stringify({ status: "loaded", count: tasks.length, tasks }, null, 2),
    }],
  };
}
