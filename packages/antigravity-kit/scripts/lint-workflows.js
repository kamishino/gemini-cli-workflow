#!/usr/bin/env node

const path = require("path");
const { lintWorkflowBlueprints } = require("../lib/workflow-linter");

const ROOT = path.resolve(__dirname, "..", "..", "..");

function getFlagValue(args, flag) {
  const directIndex = args.indexOf(flag);
  if (directIndex !== -1 && args[directIndex + 1]) {
    return args[directIndex + 1];
  }

  const prefix = `${flag}=`;
  const withEquals = args.find((arg) => arg.startsWith(prefix));
  if (withEquals) {
    return withEquals.slice(prefix.length);
  }

  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const workflowsArg = getFlagValue(args, "--source");
  const workflowsRoot = workflowsArg
    ? path.resolve(process.cwd(), workflowsArg)
    : path.join(ROOT, "resources", "blueprints", "workflows");

  const summary = await lintWorkflowBlueprints({ workflowsRoot });

  console.log("🔎 Workflow Lint");
  console.log(`  source root: ${summary.workflowsRoot}`);
  console.log(`  source dir:  ${summary.sourceDir}`);
  console.log(`  files linted: ${summary.filesLinted}`);

  if (summary.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${summary.warnings.length})`);
    for (const warning of summary.warnings) {
      console.log(`  - ${warning}`);
    }
  }

  if (summary.errors.length > 0) {
    console.log(`\n❌ Errors (${summary.errors.length})`);
    for (const error of summary.errors) {
      console.log(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log("\n✅ Workflow lint passed.");
}

main().catch((error) => {
  console.error(`❌ Workflow lint failed: ${error.message}`);
  process.exit(1);
});
