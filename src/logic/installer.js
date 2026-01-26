#!/usr/bin/env node

/**
 * KamiFlow Universal Installer
 * Supported: Windows, MacOS, Linux
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

// Constants
const REPO_URL = 'https://github.com/kamishino/gemini-cli-workflow.git';
const INSTALL_DIR = path.join(os.homedir(), '.kami-flow');

async function run() {
  console.log(chalk.cyan('\n========================================================'));
  console.log(chalk.cyan('  🌊 KamiFlow Universal Installer'));
  console.log(chalk.cyan('========================================================\n'));

  try {
    // 1. Environment Check
    checkPrerequisites();

    // 2. Install Directory Prep
    prepareInstallDir();

    // 3. Clone Repository
    cloneRepo();

    // 4. Install & Link
    installAndLink();

    // 5. Success
    showSuccess();

  } catch (error) {
    console.error(chalk.red('\n❌ Installation failed:'), error.message);
    process.exit(1);
  }
}

function checkPrerequisites() {
  process.stdout.write('🔍 Checking environment... ');
  
  try {
    // Check Node
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    if (major < 16) {
      throw new Error(`Node.js version must be >= 16. Current: ${nodeVersion}`);
    }

    // Check Git
    try {
      execSync('git --version', { stdio: 'ignore' });
    } catch (e) {
      throw new Error('Git is not installed. Please install Git from https://git-scm.com/');
    }

    console.log(chalk.green('Ready!'));
  } catch (err) {
    console.log(chalk.red('Failed'));
    throw err;
  }
}

function prepareInstallDir() {
  if (fs.existsSync(INSTALL_DIR)) {
    console.log(chalk.yellow(`⚠️  Installation directory already exists: ${INSTALL_DIR}`));
    // In a real script, we might ask to delete or update.
    // For now, we'll try to update (pull) or overwrite.
    console.log(chalk.gray('   Updating existing installation...'));
  } else {
    console.log(chalk.gray(`📂 Target directory: ${INSTALL_DIR}`));
  }
}

function cloneRepo() {
  if (fs.existsSync(INSTALL_DIR)) {
    console.log('📡 Updating source code...');
    try {
      execSync('git pull', { cwd: INSTALL_DIR, stdio: 'inherit' });
    } catch (e) {
      console.log(chalk.yellow('   Pull failed, attempting fresh clone...'));
      fs.removeSync(INSTALL_DIR);
      execSync(`git clone ${REPO_URL} "${INSTALL_DIR}"`, { stdio: 'inherit' });
    }
  } else {
    console.log('📡 Cloning repository...');
    execSync(`git clone ${REPO_URL} "${INSTALL_DIR}"`, { stdio: 'inherit' });
  }
}

function installAndLink() {
  console.log('📦 Installing dependencies and linking CLI...');
  
  // Install dependencies
  execSync('npm install --production', { cwd: INSTALL_DIR, stdio: 'inherit' });

  // Link global
  // Using 'npm install -g .' is more robust than 'npm link' for global discovery
  console.log(chalk.gray('🔗 Linking