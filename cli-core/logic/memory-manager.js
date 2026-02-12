const fs = require("fs-extra");
const path = require("upath");
const chalk = require("chalk");
const logger = require("../utils/logger");
const { WorkspaceIndex } = require("./workspace-index");
const InsightManager = require("./insight-manager");

/**
 * MemoryManager - The "Brain" for Hybrid Memory Fusion
 * Combines SQLite FTS5 (BM25) with Recursive Graph Traversal
 */
class MemoryManager {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.index = new WorkspaceIndex(projectRoot);
    this.insightManager = new InsightManager(projectRoot);
    this.weights = {
      lineage: 2.0,
      references: 1.0,
      fts: 0.4,
      graph: 0.6,
    };
  }

  /**
   * Main entry point for Memory Recall
   */
  async generateRecall(query, options = {}) {
    await this.index.initialize();

    // 1. Discover Synonyms to expand search
    const category = options.category || "logic";
    const synonyms = await this.discoverSynonyms(category);

    // 2. Perform FTS5 Search
    const ftsResponse = await this.index.search(query, {
      limit: 10,
      synonyms,
      skipAutoLink: true,
    });

    if (ftsResponse.results.length === 0) {
      return "No relevant memories found for this topic yet. Let's start building them!";
    }

    // 3. Calculate Fusion Scores
    const memoryNodes = await this.calculateFusionScore(
      query,
      ftsResponse.results,
    );

    // 4. Render Memory Cards
    console.log(chalk.cyan.bold(`\n🧠 AGENTIC RECALL: "${query}"\n`));

    memoryNodes.slice(0, 3).forEach((node) => {
      let color = "blue";
      let label = "REFERENCE";

      if (node.score > 20) {
        color = "red";
        label = "LINEAGE";
      } else if (node.score > 10) {
        color = "yellow";
        label = "HIGH RELEVANCE";
      }

      logger.card(node, { color, label });
    });

    // 5. Synthesize Summary (Paragraph version)
    return this.synthesizeSummary(query, memoryNodes);
  }

  /**
   * Hybrid Fusion: Combine FTS Rank with Graph Weights
   */
  async calculateFusionScore(query, ftsResults) {
    const memoryNodes = new Map();

    for (const result of ftsResults) {
      const taskId = this.extractTaskId(result.filePath);
      if (!taskId) continue;

      // Base FTS Score
      let score = result.score * this.weights.fts;

      // Expand via Graph Neighbors
      const neighbors = await this.getRecursiveNeighbors(taskId, 2);

      // Calculate Graph Influence
      let graphScore = 0;
      neighbors.forEach((weight, neighborId) => {
        graphScore += weight;
      });

      score += graphScore * this.weights.graph;

      memoryNodes.set(taskId, {
        id: taskId,
        score,
        title: result.title,
        snippet: result.snippet,
        path: result.filePath,
        category: result.category,
      });
    }

    // Sort by final score
    return Array.from(memoryNodes.values()).sort((a, b) => b.score - a.score);
  }

  /**
   * Recursive Neighbor Discovery (Depth-limited)
   */
  async getRecursiveNeighbors(nodeId, maxDepth = 2) {
    const visited = new Map(); // id -> weight
    const queue = [{ id: nodeId, depth: 0, weight: 1.0 }];

    while (queue.length > 0) {
      const { id, depth, weight } = queue.shift();
      if (depth >= maxDepth) continue;

      const neighbors = await this.index.getNeighbors(id);
      for (const rel of neighbors) {
        if (!visited.has(rel.node)) {
          const relWeight =
            rel.rel_type === "lineage"
              ? this.weights.lineage
              : this.weights.references;
          const newWeight = weight * relWeight * (1 / (depth + 1));

          visited.set(rel.node, newWeight);
          queue.push({ id: rel.node, depth: depth + 1, weight: newWeight });
        }
      }
    }

    return visited;
  }

  /**
   * Automatic Synonym Discovery based on Category
   */
  async discoverSynonyms(category) {
    if (!this.index.isNative) return [];

    try {
      const sql = `
        SELECT title FROM files_meta 
        WHERE category = ? 
        ORDER BY modified_at DESC LIMIT 20
      `;
      const rows = this.index.db.prepare(sql).all(category);
      const keywords = new Set();

      rows.forEach((row) => {
        // Extract key words from titles (3+ chars)
        const words = row.title.toLowerCase().match(/\b\w{4,}\b/g) || [];
        words.forEach((w) => keywords.add(w));
      });

      return Array.from(keywords).slice(0, 5);
    } catch (e) {
      return [];
    }
  }

  /**
   * Assemble Insights into 1-2 Paragraphs
   */
  async synthesizeSummary(query, nodes) {
    const topNodes = nodes.slice(0, 3);
    const insights = [];

    for (const node of topNodes) {
      const taskInsights = await this.insightManager.extractFromArchive(
        node.id,
      );
      if (taskInsights.length > 0) {
        insights.push(...taskInsights.slice(0, 2));
      }
    }

    if (insights.length === 0) {
      const titles = topNodes
        .map((n) => `Task ${n.id} (${n.title})`)
        .join(", ");
      return `We have worked on similar concepts in ${titles}. While no specific strategic lessons were recorded, those tasks provide the foundation for this architecture.`;
    }

    // Assemble the summary paragraph
    const wisdomPoints = insights
      .map((i) => i.wisdom.replace(/\*\*[^*]+\*\*:\s*/, ""))
      .slice(0, 4);
    const paragraph =
      `Based on our history with "${query}", we've learned that ${wisdomPoints[0].toLowerCase().replace(/\.$/, "")}. ` +
      (wisdomPoints[1]
        ? `Strategically, ${wisdomPoints[1].toLowerCase().replace(/\.$/, "")}. `
        : "") +
      `These insights from Task ${insights[0].id} and others anchor our current approach to project integrity.`;

    return paragraph;
  }

  extractTaskId(filePath) {
    const match = filePath.match(/_(\d{3})_/);
    return match ? match[1] : null;
  }
}

module.exports = { MemoryManager };
