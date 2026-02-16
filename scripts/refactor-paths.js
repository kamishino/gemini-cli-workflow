// Bulk find-replace script for path refactor
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const replacements = [
  // cli-core → packages/kamiflow-cli
  { find: /cli-core\//g, replace: "packages/kamiflow-cli/" },
  { find: /cli-core"/g, replace: 'packages/kamiflow-cli"' },
  { find: /cli-core\\/g, replace: "packages\\kamiflow-cli\\" },

  // resources/ paths that moved
  { find: /resources\/docs\//g, replace: "packages/kamiflow-cli/docs/" },
  { find: /resources\/schemas\//g, replace: "packages/kamiflow-cli/schemas/" },
  {
    find: /resources\/templates\//g,
    replace: "resources/blueprints/templates/",
  },
];

const filesToUpdate = [
  "packages/kamiflow-cli/logic/**/*.js",
  "packages/kamiflow-cli/scripts/**/*.js",
  "packages/kamiflow-cli/tests/**/*.js",
  "packages/kamiflow-cli/utils/**/*.js",
  "packages/antigravity-kit/scripts/sync-templates.js",
  "docs/**/*.md",
];

console.log("🔄 Starting bulk path replacement...\n");

filesToUpdate.forEach((pattern) => {
  try {
    const files = execSync(
      `Get-ChildItem "${pattern}" -Recurse -File | Select-Object -ExpandProperty FullName`,
      {
        shell: "powershell.exe",
        encoding: "utf-8",
        cwd: __dirname,
      },
    )
      .trim()
      .split("\n")
      .filter(Boolean);

    files.forEach((file) => {
      if (!fs.existsSync(file)) return;

      let content = fs.readFileSync(file, "utf-8");
      let changed = false;

      replacements.forEach(({ find, replace }) => {
        if (content.match(find)) {
          content = content.replace(find, replace);
          changed = true;
        }
      });

      if (changed) {
        fs.writeFileSync(file, content, "utf-8");
        console.log(`✅ ${path.relative(process.cwd(), file)}`);
      }
    });
  } catch (e) {
    // Pattern might not match any files
  }
});

console.log("\n✨ Done!");
