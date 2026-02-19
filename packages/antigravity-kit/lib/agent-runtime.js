/**
 * Agent Runtime — Intelligent agent suggestion engine
 *
 * Matches user intent against agent triggers and ownership metadata
 * to recommend the most relevant agent for a given task.
 */

const fs = require("fs-extra");
const path = require("path");
const { parseAllAgents } = require("./frontmatter");

/**
 * Score an agent's relevance to a query
 * @param {object} agent - Parsed agent { file, name, description, triggers, owns }
 * @param {string[]} queryWords - Lowercased words from user query or git diff
 * @returns {number} relevance score (0 = no match)
 */
function scoreAgent(agent, queryWords) {
  let score = 0;

  // Trigger keyword matches (highest weight)
  for (const trigger of agent.triggers || []) {
    const tLower = trigger.toLowerCase();
    for (const word of queryWords) {
      if (word === tLower) {
        score += 10; // exact match
      } else if (word.includes(tLower) || tLower.includes(word)) {
        score += 5; // partial match
      }
    }
  }

  // Description matches (medium weight)
  if (agent.description) {
    const descWords = agent.description.toLowerCase().split(/\s+/);
    for (const word of queryWords) {
      if (descWords.includes(word)) {
        score += 2;
      }
    }
  }

  // Name match (low weight)
  if (agent.name) {
    const nameLower = agent.name.toLowerCase();
    for (const word of queryWords) {
      if (nameLower === word) {
        score += 8;
      } else if (nameLower.includes(word)) {
        score += 3;
      }
    }
  }

  // Ownership matches — if query mentions a file the agent owns
  for (const owned of agent.owns || []) {
    const ownedLower = owned.toLowerCase();
    for (const word of queryWords) {
      if (ownedLower.includes(word)) {
        score += 4;
      }
    }
  }

  return score;
}

/**
 * Suggest agents based on a text query
 * @param {string} agentsDir - Path to agents directory
 * @param {string} query - User query or context text
 * @returns {Promise<Array<{agent: object, score: number}>>} Ranked list
 */
async function suggest(agentsDir, query) {
  if (!(await fs.pathExists(agentsDir))) return [];

  const agents = await parseAllAgents(agentsDir);
  const queryWords = query
    .toLowerCase()
    .split(/[\s,.:;!?()[\]{}'"\/\\|@#$%^&*+=<>~`]+/)
    .filter((w) => w.length > 2); // skip short words

  const scored = agents
    .map((agent) => ({
      agent,
      score: scoreAgent(agent, queryWords),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored;
}

/**
 * Suggest agents based on git diff (changed file paths)
 * @param {string} agentsDir
 * @param {string[]} changedFiles - Array of changed file paths
 * @returns {Promise<Array<{agent: object, score: number}>>}
 */
async function suggestFromFiles(agentsDir, changedFiles) {
  if (!(await fs.pathExists(agentsDir))) return [];

  const agents = await parseAllAgents(agentsDir);

  const scored = agents
    .map((agent) => {
      let score = 0;

      // Check if any owned files overlap with changed files
      for (const owned of agent.owns || []) {
        for (const changed of changedFiles) {
          if (
            changed.includes(owned.replace(/^\.\//, "")) ||
            owned.includes(path.basename(changed))
          ) {
            score += 10;
          }
        }
      }

      return { agent, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored;
}

module.exports = { scoreAgent, suggest, suggestFromFiles };
