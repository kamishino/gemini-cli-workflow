const { execSync } = require("child_process");
const path = require("upath");
const chalk = require("chalk");
const fs = require("fs");

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, "../../");
const PACKAGE_PATH = path.resolve(__dirname, "../package.json");

function log(msg, type = "info") {
  if (type === "success") console.log(chalk.green(`✅ ${msg}`));
  else if (type === "error") console.log(chalk.red(`❌ ${msg}`));
  else console.log(chalk.blue(`ℹ️ ${msg}`));
}

async function main() {
  try {
    // 1. Load version from package.json
    if (!fs.existsSync(PACKAGE_PATH)) {
      throw new Error(`Package file not found at: ${PACKAGE_PATH}`);
    }
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf8"));
    const version = pkg.version;

    log(`Starting Git Release for v${version}...`);

    // 2. Post-Bump Polishing (Double Check)
    log("Performing Atomic Polish (Roadmap & Docs)...");
    try {
      execSync("node scripts/roadmap-generator.js", { cwd: path.dirname(__dirname), stdio: "inherit" });
      execSync("node scripts/sync-docs.js", { cwd: path.dirname(__dirname), stdio: "inherit" });
    } catch (e) {
      log("Polishing failed, but continuing with release...", "warning");
    }

    // 3. Stage all changes at project root
    log("Staging files at root...");
    execSync("git add .", { cwd: PROJECT_ROOT, stdio: "inherit" });

    // 4. Smart Commit Logic
    const commitMsg = `chore(release): ${version}`;

    // Check if the current commit is already a release commit (made by npm version)
    let shouldAmend = false;
    try {
      const lastCommitMsg = execSync("git log -1 --pretty=%s", { cwd: PROJECT_ROOT }).toString().trim();
      // If npm version created a commit, it might look like the version number
      if (lastCommitMsg === version || lastCommitMsg === `v${version}`) {
        shouldAmend = true;
      }
    } catch (e) {
      // Failed to check, fallback to normal commit
    }

    if (shouldAmend) {
      log(`Amending release commit: "${commitMsg}"...`);
      execSync(`git commit --amend -m "${commitMsg}"`, { cwd: PROJECT_ROOT, stdio: "inherit" });
    } else {
      log(`Creating release commit: "${commitMsg}"...`);
      execSync(`git commit -m "${commitMsg}"`, { cwd: PROJECT_ROOT, stdio: "inherit" });
    }

    // 5. Create tag
    const tagName = `v${version}`;
    log(`Creating tag: ${tagName}...`);
    // Delete tag if already exists locally (in case of retry)
    try {
      execSync(`git tag -d ${tagName}`, { cwd: PROJECT_ROOT, stdio: "ignore" });
    } catch (e) {
      // Tag doesn't exist, fine
    }

    // v2.0 enhancement: Add annotation for v2.x releases
    if (version.startsWith("2.")) {
      const annotationMsg = `v${version} - KamiFlow v2.0 Series (Enhanced Stability & Anti-Hallucination)`;
      try {
        execSync(`git tag -a ${tagName} -m "${annotationMsg}" -f`, { cwd: PROJECT_ROOT, stdio: "inherit" });
        log("Tagged as v2.0 series release", "success");
      } catch (e) {
        // Fallback to lightweight tag
        execSync(`git tag ${tagName}`, { cwd: PROJECT_ROOT, stdio: "inherit" });
      }
    } else {
      execSync(`git tag ${tagName}`, { cwd: PROJECT_ROOT, stdio: "inherit" });
    }

    log(`Git Release v${version} complete!`, "success");
  } catch (error) {
    log(error.message, "error");
    process.exit(1);
  }
}

main();
