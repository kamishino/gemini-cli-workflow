/* eslint-disable no-process-exit */
/**
 * Swarm commands: check-swarm, lock-swarm, unlock-swarm, sync-skills
 */
const path = require("upath");
const logger = require("../utils/logger");

module.exports = function register(program, execute) {
  const {
    acquireLock,
    releaseLock,
    getSwarmStatus,
  } = require("../logic/swarm-dispatcher");

  program
    .command("check-swarm")
    .alias("swarm")
    .description("Show active locks and swarm health")
    .action(async () => {
      await execute(null, async () => {
        const status = await getSwarmStatus();
        if (status.activeLocks && status.activeLocks.length > 0) {
          logger.warn("Active Swarm Locks:");
          status.activeLocks.forEach((l) => {
            logger.hint(`${l.folder}: Locked by ${l.agent} (${l.timestamp})`);
          });
        } else {
          logger.success("Swarm is ready. No active locks.");
        }
      });
    });

  program
    .command("lock-swarm <folder> <agentId>")
    .description("Manually set a swarm lock")
    .action(async (folder, agentId) => {
      await execute(null, async () => {
        await acquireLock(path.resolve(process.cwd(), folder), agentId);
      });
    });

  program
    .command("unlock-swarm <folder>")
    .description("Manually release a swarm lock")
    .action(async (folder) => {
      await execute(null, async () => {
        await releaseLock(path.resolve(process.cwd(), folder));
      });
    });

  // Sync Skills command
  program
    .command("sync-skills")
    .alias("skills")
    .description("Sync skills from resources/skills/ to .gemini/skills/")
    .action(async () => {
      await execute("Syncing Skills", async () => {
        const { syncSkills } = require("../logic/skill-sync");
        await syncSkills();
      });
    });
};
