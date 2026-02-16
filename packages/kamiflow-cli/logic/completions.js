const chalk = require("chalk");
const logger = require("../utils/logger");

/**
 * Shell Completions Generator
 * Generates completion scripts for various shells by introspecting commander.
 */

/**
 * Get all command names and aliases from the CLI
 * @returns {string[]} Array of command names
 */
function getCommandList() {
  // Hardcoded list derived from kami.js to avoid circular dependency.
  // Kept in sync via sync-docs script.
  return [
    "init-project",
    "init",
    "upgrade-core",
    "upgrade",
    "sync-rules",
    "clean-rules",
    "wipe",
    "show-info",
    "info",
    "check-config",
    "validate",
    "check-health",
    "doctor",
    "manage-config",
    "config",
    "sync-docs",
    "update-roadmap",
    "roadmap",
    "advice",
    "consult",
    "build-agents",
    "transpile",
    "archive-task",
    "archive",
    "sync-skills",
    "skills",
    "check-swarm",
    "swarm",
    "lock-swarm",
    "unlock-swarm",
    "search-workspace",
    "search",
    "sync-db",
    "db",
    "run-saiyan",
    "saiyan",
    "run-batch",
    "supersaiyan",
    "learn-flow",
    "tour",
    "show-dashboard",
    "dashboard",
    "manage-hooks",
    "hooks",
    "generate-completions",
    "completions",
    "help",
  ];
}

/**
 * Generate Bash completion script
 */
function generateBash() {
  const commands = getCommandList();
  const cmdList = commands.join(" ");

  return `# KamiFlow Bash Completion
# Add to ~/.bashrc: eval "$(kamiflow completions bash)"
# Or: kamiflow completions bash >> ~/.bashrc

_kamiflow_completions() {
    local cur="\${COMP_WORDS[COMP_CWORD]}"
    local commands="${cmdList}"
    COMPREPLY=($(compgen -W "$commands" -- "$cur"))
}

complete -F _kamiflow_completions kamiflow
complete -F _kamiflow_completions kami
`;
}

/**
 * Generate Zsh completion script
 */
function generateZsh() {
  const commands = getCommandList();
  const cmdList = commands.join(" ");

  return `# KamiFlow Zsh Completion
# Add to ~/.zshrc: eval "$(kamiflow completions zsh)"
# Or: kamiflow completions zsh >> ~/.zshrc

_kamiflow_completions() {
    local commands="${cmdList}"
    _arguments "1: :($commands)"
}

compdef _kamiflow_completions kamiflow
compdef _kamiflow_completions kami
`;
}

/**
 * Generate Fish completion script
 */
function generateFish() {
  const commands = getCommandList();
  const lines = commands
    .map(
      (cmd) =>
        `complete -c kamiflow -n '__fish_use_subcommand' -a '${cmd}' -d ''`,
    )
    .join("\n");

  return `# KamiFlow Fish Completion
# Save to: ~/.config/fish/completions/kamiflow.fish
# Or: kamiflow completions fish > ~/.config/fish/completions/kamiflow.fish

${lines}

# Alias completions
complete -w kamiflow kami
`;
}

/**
 * Generate PowerShell completion script
 */
function generatePowerShell() {
  const commands = getCommandList();
  const cmdArray = commands.map((c) => `'${c}'`).join(", ");

  return `# KamiFlow PowerShell Completion
# Add to $PROFILE: kamiflow completions powershell | Out-String | Invoke-Expression
# Or: kamiflow completions powershell >> $PROFILE

Register-ArgumentCompleter -CommandName kamiflow, kami -ScriptBlock {
    param($commandName, $wordToComplete, $cursorPosition)
    
    $commands = @(${cmdArray})
    
    $commands | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
    }
}
`;
}

/**
 * Run completions generation
 * @param {string} shell - Target shell: bash, zsh, fish, powershell
 */
function runCompletions(shell) {
  if (!shell) {
    logger.header("Shell Completions");
    console.log(
      chalk.white("  Generate tab-completion scripts for your shell.\n"),
    );
    console.log(chalk.gray("  Usage:"));
    console.log(chalk.yellow("    kamiflow completions bash"));
    console.log(chalk.yellow("    kamiflow completions zsh"));
    console.log(chalk.yellow("    kamiflow completions fish"));
    console.log(chalk.yellow("    kamiflow completions powershell"));
    console.log();
    console.log(chalk.gray("  Install:"));
    console.log(chalk.gray('    Bash: eval "$(kamiflow completions bash)"'));
    console.log(chalk.gray('    Zsh:  eval "$(kamiflow completions zsh)"'));
    console.log(
      chalk.gray(
        "    Fish: kamiflow completions fish > ~/.config/fish/completions/kamiflow.fish",
      ),
    );
    console.log(
      chalk.gray(
        "    PS:   kamiflow completions powershell | Out-String | Invoke-Expression",
      ),
    );
    console.log();
    return;
  }

  const generators = {
    bash: generateBash,
    zsh: generateZsh,
    fish: generateFish,
    powershell: generatePowerShell,
    ps: generatePowerShell,
    pwsh: generatePowerShell,
  };

  const generator = generators[shell.toLowerCase()];
  if (!generator) {
    logger.error(
      `Unknown shell: ${shell}. Supported: bash, zsh, fish, powershell`,
    );
    return;
  }

  // Output raw script to stdout for piping
  process.stdout.write(generator());
}

module.exports = { runCompletions, getCommandList };
