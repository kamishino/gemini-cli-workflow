#!/usr/bin/env node

const path = require("path");
const {
  renderWorkflowTemplates,
  normalizeModelProfile,
  normalizeTargetProfile,
} = require("../lib/workflow-renderer");

const ROOT = path.resolve(__dirname, "..", "..", "..");

/**
 * Read flag value supporting both "--flag value" and "--flag=value".
 * @param {string[]} args
 * @param {string} flag
 * @returns {string|null}
 */
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

function showHelp() {
  console.log(`
Usage:
  node scripts/render-workflows.js [options]

Options:
  --target <profile>         Target runtime profile (default: antigravity)
  --model-profile <profile>  Model profile overlay (default: default)
  --source <path>            Workflows root path (default: resources/blueprints/workflows)
  --output <path>            Output directory (default: packages/antigravity-kit/templates/workflows)
  --force                    Overwrite non-managed existing files
  --prune                    Remove managed files not present in source registry
  --help                     Show this message
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
    return;
  }

  const sourceArg = getFlagValue(args, "--source");
  const outputArg = getFlagValue(args, "--output");
  const targetArg = getFlagValue(args, "--target") || "antigravity";
  const modelArg = getFlagValue(args, "--model-profile") || "default";

  const workflowsRoot = sourceArg
    ? path.resolve(process.cwd(), sourceArg)
    : path.join(ROOT, "resources", "blueprints", "workflows");
  const outputDir = outputArg
    ? path.resolve(process.cwd(), outputArg)
    : path.join(ROOT, "packages", "antigravity-kit", "templates", "workflows");

  const targetProfile = normalizeTargetProfile(targetArg);
  const modelProfile = normalizeModelProfile(modelArg);
  const result = await renderWorkflowTemplates({
    workflowsRoot,
    outputDir,
    targetProfile,
    modelProfile,
    force: args.includes("--force"),
    pruneUnknown: args.includes("--prune"),
  });

  console.log("🧩 Workflow render complete");
  console.log(`  target: ${result.targetProfile}`);
  console.log(`  model:  ${result.modelProfile}`);
  console.log(`  source: ${result.sourceDir}`);
  console.log(`  rendered: ${result.renderedFiles.length}`);
  console.log(`  created:  ${result.createdFiles.length}`);
  console.log(`  updated:  ${result.updatedFiles.length}`);
  console.log(`  skipped legacy: ${result.skippedLegacyFiles.length}`);

  if (result.missingSourceFiles.length > 0) {
    console.log(
      `  missing source entries: ${result.missingSourceFiles.length}`,
    );
  }
  if (result.extraFiles.length > 0) {
    console.log(`  extra output files: ${result.extraFiles.length}`);
  }
  if (result.removedFiles.length > 0) {
    console.log(`  removed: ${result.removedFiles.length}`);
  }
}

main().catch((error) => {
  console.error(`❌ Render failed: ${error.message}`);
  process.exit(1);
});
