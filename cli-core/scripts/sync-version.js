/* eslint-disable no-process-exit */
const fs = require("fs");
const path = require("upath");
const execa = require("execa");
const chalk = require("chalk");
const { EnvironmentManager } = require("../logic/env-manager");

// Path adjusted for deep structure (cli-core/scripts/)
const PACKAGE_PATH = path.join(__dirname, "../package.json");
const README_PATH = path.join(__dirname, "../../README.md");
const BIN_PATH = path.join(__dirname, "../bin/kami.js");
const CHANGELOG_PATH = path.join(__dirname, "../../CHANGELOG.md");

// --- Helpers ---
function log(msg, type = "info") {
  if (type === "success") console.log(chalk.green(`✅ ${msg}`));
  else if (type === "error") console.log(chalk.red(`❌ ${msg}`));
  else console.log(chalk.blue(`ℹ️ ${msg}`));
}

// --- Main Logic ---
async function main() {
  try {
    const projectRoot = path.resolve(__dirname, "../../");
    const envManager = new EnvironmentManager(projectRoot);
    const workspaceRoot = await envManager.getAbsoluteWorkspacePath();
    const CONTEXT_PATH = path.join(workspaceRoot, "PROJECT_CONTEXT.md");

    // 1. Get New Version
    const packageJson = require(PACKAGE_PATH);
    const newVersion = packageJson.version;
    log(`Syncing version: v${newVersion}`);

    // 2. Update README.md
    if (fs.existsSync(README_PATH)) {
      let readme = fs.readFileSync(README_PATH, "utf8");
      readme = readme.replace(
        /(Version:\s*v?)\d+\.\d+\.\d+[-\w.]*/g,
        `$1${newVersion}`,
      );
      readme = readme.replace(/v\d+\.\d+\.\d+[-\w.]*/g, `v${newVersion}`);
      readme = readme.replace(/#v\d+\.\d+\.\d+[-\w.]*/g, `#v${newVersion}`);
      readme = readme.replace(
        /tags\/v\d+\.\d+\.\d+[-\w.]*/g,
        `tags/v${newVersion}`,
      );
      // v2.0 enhancement: Handle "KamiFlow v2.36.0" pattern
      readme = readme.replace(
        /(KamiFlow\s+v?)\d+\.\d+\.\d+/gi,
        `$1${newVersion}`,
      );
      readme = readme.replace(/(version-v?)\d+\.\d+\.\d+/gi, `$1${newVersion}`);
      fs.writeFileSync(README_PATH, readme);
      log(`Updated README.md`, "success");
    }

    // 3. Update PROJECT_CONTEXT.md
    if (fs.existsSync(CONTEXT_PATH)) {
      let context = fs.readFileSync(CONTEXT_PATH, "utf8");
      context = context.replace(
        /(Template v?)\d+\.\d+\.\d+[-\w.]*/g,
        `$1${newVersion}`,
      );
      context = context.replace(
        /(Version:?\s*)\d+\.\d+\.\d+[-\w.]*/g,
        `$1${newVersion}`,
      );
      fs.writeFileSync(CONTEXT_PATH, context);
      log(`Updated PROJECT_CONTEXT.md`, "success");
    }

    // 4. Update bin/kami.js
    if (fs.existsSync(BIN_PATH)) {
      let binContent = fs.readFileSync(BIN_PATH, "utf8");
      binContent = binContent.replace(
        /\.version\(['"](.*?)['"]\)/,
        `.version('${newVersion}')`,
      );
      fs.writeFileSync(BIN_PATH, binContent);
      log(`Updated bin/kami.js`, "success");
    }

    // 5. Generate Changelog
    await generateChangelog(newVersion);
  } catch (error) {
    log(error.message, "error");
    process.exit(1);
  }
}

async function generateChangelog(newVersion) {
  try {
    let lastTag = "";
    try {
      const { stdout } = await execa("git", ["tag", "--sort=-creatordate"]);
      const tags = stdout.split("\n").filter(Boolean);
      lastTag = tags[0] || "";
    } catch (e) {
      log("No previous tags found.", "info");
    }

    const range = lastTag ? `${lastTag}..HEAD` : "HEAD";
    const { stdout: commitsRaw } = await execa("git", [
      "log",
      range,
      "--pretty=format:%h|%s|%an",
    ]);

    if (!commitsRaw) {
      log("No new commits found.", "info");
      return;
    }

    const commits = commitsRaw.split("\n").map((line) => {
      const [hash, subject, author] = line.split("|");
      return { hash, subject, author };
    });

    const groups = { feat: [], fix: [], chore: [], docs: [], other: [] };

    commits.forEach((c) => {
      if (c.subject.match(/^chore(release):/)) return;
      if (c.subject.match(/^\d+\.\d+\.\d+/)) return;
      const match = c.subject.match(
        /^(feat|fix|chore|docs|refactor|test)(\(.*\))?: (.*)$/,
      );
      if (match) {
        const type = match[1];
        if (groups[type]) groups[type].push(c);
        else groups.other.push(c);
      } else {
        groups.other.push(c);
      }
    });

    const date = new Date().toISOString().split("T")[0];
    let md = `
## [v${newVersion}] - ${date}

`;

    if (groups.feat.length > 0) {
      md += `### 🚀 Features
`;
      groups.feat.forEach(
        (c) =>
          (md += `- ${c.subject} (${c.hash})
`),
      );
      md += `
`;
    }

    if (groups.fix.length > 0) {
      md += `### 🐛 Fixes
`;
      groups.fix.forEach(
        (c) =>
          (md += `- ${c.subject} (${c.hash})
`),
      );
      md += `
`;
    }

    const others = [...groups.chore, ...groups.docs, ...groups.other];
    if (others.length > 0) {
      md += `### 🧹 Chores & Others
`;
      others.forEach(
        (c) =>
          (md += `- ${c.subject} (${c.hash})
`),
      );
      md += `
`;
    }

    let currentContent = "";
    if (fs.existsSync(CHANGELOG_PATH)) {
      currentContent = fs.readFileSync(CHANGELOG_PATH, "utf8");
    } else {
      currentContent =
        "# Changelog\nAll notable changes to this project will be documented in this file.\n";
    }

    const titleRegex = /# Changelog\n.*?\n/s;
    const hasTitle = titleRegex.test(currentContent);

    if (hasTitle) {
      const newContent = currentContent.replace(
        /(# Changelog\n.*?\n)/s,
        `$1${md}`,
      );
      fs.writeFileSync(CHANGELOG_PATH, newContent);
    } else {
      fs.writeFileSync(CHANGELOG_PATH, md + currentContent);
    }

    log(`Generated Changelog for v${newVersion}`, "success");
  } catch (error) {
    log(`Changelog Error: ${error.message}`, "error");
  }
}

main();
