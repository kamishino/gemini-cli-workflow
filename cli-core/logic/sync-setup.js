const inquirer = require("inquirer").default;
const chalk = require("chalk");
const { CredentialManager } = require("./credential-manager");
const { ConfigManager } = require("./config-manager");
const { SyncClient } = require("./sync-client");
const crypto = require("crypto");

/**
 * Interactive sync setup wizard
 */
async function setupSync(projectRoot, options = {}) {
  console.log(chalk.cyan("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(chalk.cyan.bold("🔄 KamiFlow Sync Setup\n"));

  const configManager = new ConfigManager(projectRoot);
  const credentialManager = new CredentialManager(projectRoot);

  // Step 1: Choose deployment option
  let backend = options.backend;
  let apiKey = options.apiKey;

  if (!backend) {
    const { deploymentChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "deploymentChoice",
        message: "Choose deployment option:",
        choices: [
          { name: "I already have a backend running", value: "existing" },
          {
            name: "Help me deploy to Cloudflare (guided setup)",
            value: "cloudflare",
          },
          { name: "Help me set up self-hosted (Docker)", value: "selfhosted" },
        ],
      },
    ]);

    if (deploymentChoice === "cloudflare") {
      await guidedCloudflareSetup();
      return;
    } else if (deploymentChoice === "selfhosted") {
      await guidedSelfHostedSetup();
      return;
    }

    // Existing backend
    const { backendUrl } = await inquirer.prompt([
      {
        type: "input",
        name: "backendUrl",
        message: "Backend URL:",
        validate: (input) => {
          try {
            new URL(input);
            return true;
          } catch {
            return "Please enter a valid URL";
          }
        },
      },
    ]);
    backend = backendUrl;
  }

  // Step 2: Get API key
  if (!apiKey) {
    const { apiKeyInput } = await inquirer.prompt([
      {
        type: "password",
        name: "apiKeyInput",
        message: "API Key:",
        mask: "*",
      },
    ]);
    apiKey = apiKeyInput;
  }

  // Step 3: Test connection
  console.log(chalk.gray("\nTesting connection..."));
  const client = new SyncClient(backend, apiKey);
  try {
    await client.testConnection();
    console.log(chalk.green("✅ Connected!\n"));
  } catch (error) {
    console.log(chalk.red(`❌ Connection failed: ${error.message}`));
    console.log(chalk.gray("Please check your backend URL and API key.\n"));
    return;
  }

  // Step 4: Choose sync mode
  const { syncMode } = await inquirer.prompt([
    {
      type: "list",
      name: "syncMode",
      message: "Sync mode:",
      choices: [
        {
          name: "Manual (use 'kami sync' when you want to sync)",
          value: "manual",
        },
        {
          name: "On-Command (sync after 'kami archive', etc.)",
          value: "on-command",
        },
      ],
    },
  ]);

  // Step 5: Generate project ID if not exists
  let projectId = await configManager.get("sync.projectId");
  if (!projectId) {
    projectId = crypto.randomBytes(16).toString("hex");
  }

  // Step 6: Save configuration
  await configManager.set("sync.enabled", true);
  await configManager.set("sync.backend", backend);
  await configManager.set("sync.mode", syncMode);
  await configManager.set("sync.projectId", projectId);
  await configManager.set("sync.categories", ["archive", "ideas", "tasks"]);

  // Step 7: Store credentials securely
  credentialManager.projectId = projectId;
  const result = await credentialManager.setApiKey(apiKey);

  console.log(chalk.green("\n✅ Sync configured successfully!"));
  console.log(chalk.gray(`   • Backend: ${backend}`));
  console.log(chalk.gray(`   • Mode: ${syncMode}`));
  console.log(
    chalk.gray(
      `   • Credentials: ${result.method === "keychain" ? "OS Keychain" : "Encrypted File"}`,
    ),
  );
  console.log(
    chalk.gray("\nRun 'kami sync-db push' to upload your first backup.\n"),
  );
}

/**
 * Guided Cloudflare setup
 */
async function guidedCloudflareSetup() {
  console.log(chalk.cyan("\n📖 Guided Cloudflare Setup\n"));
  console.log("Follow these steps to deploy your sync backend:\n");
  console.log("1. Clone the backend repository:");
  console.log(
    chalk.gray(
      "   git clone https://github.com/kamishino/gemini-cli-workflow.git\n",
    ),
  );
  console.log("2. Follow the setup guide:");
  console.log(
    chalk.gray("   See: resources/docs/sync/backend/README.md#cloudflare\n"),
  );
  console.log("3. Return here and run:");
  console.log(chalk.cyan("   kami sync-db setup\n"));
}

/**
 * Guided self-hosted setup
 */
async function guidedSelfHostedSetup() {
  console.log(chalk.cyan("\n🐳 Guided Self-Hosted Setup\n"));
  console.log("Follow these steps to deploy with Docker:\n");
  console.log("1. Use the included backend in this repository:");
  console.log(chalk.gray("   cd packages/sync-backend/\n"));
  console.log("2. Follow the Docker Compose guide:");
  console.log(
    chalk.gray("   See: resources/docs/sync/backend/README.md#self-hosted\n"),
  );
  console.log("3. Return here and run:");
  console.log(chalk.cyan("   kami sync-db setup\n"));
}

/**
 * Update API key
 */
async function updateApiKey(projectRoot) {
  console.log(chalk.cyan("\n🔑 Update API Key\n"));

  const credentialManager = new CredentialManager(projectRoot);
  const configManager = new ConfigManager(projectRoot);

  const backend = await configManager.get("sync.backend");
  if (!backend) {
    console.log(
      chalk.red("Sync not configured. Run 'kami sync-db setup' first.\n"),
    );
    return;
  }

  const { apiKeyInput } = await inquirer.prompt([
    {
      type: "password",
      name: "apiKeyInput",
      message: "New API Key:",
      mask: "*",
    },
  ]);

  // Test connection
  console.log(chalk.gray("\nTesting connection..."));
  const client = new SyncClient(backend, apiKeyInput);
  try {
    await client.testConnection();
    console.log(chalk.green("✅ Connected!\n"));
  } catch (error) {
    console.log(chalk.red(`❌ Connection failed: ${error.message}`));
    console.log(chalk.gray("API key not updated.\n"));
    return;
  }

  // Update credentials
  const result = await credentialManager.updateApiKey(apiKeyInput);
  console.log(chalk.green("✅ API key updated successfully!"));
  console.log(
    chalk.gray(
      `   • Storage: ${result.method === "keychain" ? "OS Keychain" : "Encrypted File"}\n`,
    ),
  );
}

module.exports = { setupSync, updateApiKey };
