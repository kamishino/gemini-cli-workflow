#!/usr/bin/env node

const path = require("path");
const { checkWorkflowDrift } = require("../lib/workflow-drift");

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
  const templatesArg = getFlagValue(args, "--templates");
  const targetArg = getFlagValue(args, "--target") || "antigravity";
  const modelArg = getFlagValue(args, "--model-profile") || "default";
  const strict = args.includes("--strict");

  const workflowsRoot = workflowsArg
    ? path.resolve(process.cwd(), workflowsArg)
    : path.join(ROOT, "resources", "blueprints", "workflows");
  const templatesDir = templatesArg
    ? path.resolve(process.cwd(), templatesArg)
    : path.join(ROOT, "packages", "antigravity-kit", "templates", "workflows");

  const result = await checkWorkflowDrift({
    workflowsRoot,
    templatesDir,
    targetProfile: targetArg,
    modelProfile: modelArg,
  });

  console.log("🧭 Workflow Drift Check");
  console.log(`  target: ${result.targetProfile}`);
  console.log(`  model:  ${result.modelProfile}`);
  console.log(`  rendered entries: ${result.rendered}`);
  console.log(`  identical: ${result.identical}`);
  console.log(`  drifted: ${result.drifted}`);
  console.log(`  missing: ${result.missing}`);
  console.log(`  unmanaged: ${result.unmanaged}`);

  if (result.missingSourceFiles.length > 0) {
    console.log(
      `\n❌ Missing source workflows in registry: ${result.missingSourceFiles.join(", ")}`,
    );
  }

  const nonIdentical = result.entries.filter(
    (entry) => entry.status !== "identical",
  );
  if (nonIdentical.length > 0) {
    console.log("\nDetails:");
    for (const entry of nonIdentical) {
      console.log(`  - ${entry.file}: ${entry.status}`);
    }
  }

  if (!result.ok) {
    console.log("\n❌ Drift check failed (blocking issues found).");
    process.exit(1);
  }

  if (strict && result.unmanaged > 0) {
    console.log(
      "\n❌ Drift check failed in strict mode (unmanaged files found).",
    );
    process.exit(1);
  }

  if (result.unmanaged > 0) {
    console.log(
      "\n⚠️  Unmanaged legacy workflow files detected (non-blocking). Use --strict to fail on this.",
    );
  }

  console.log("\n✅ Drift check passed.");
}

main().catch((error) => {
  console.error(`❌ Drift check failed: ${error.message}`);
  process.exit(1);
});
