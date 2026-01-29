#!/bin/bash

# ========================================================
#   🌊 KamiFlow One-Liner Installer (Mac/Linux/WSL)
# ========================================================

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================================${NC}"
echo -e "${CYAN}  🌊 KamiFlow Universal Installer${NC}"
echo -e "${CYAN}========================================================${NC}"
echo ""

# --- FUNCTIONS ---

# Function to load NVM into current session
hot_load_nvm() {
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
}

# Function to install NVM
install_nvm_and_node() {
    echo -e "${YELLOW}[KAMI] 🚀 Starting NVM & Node.js installation...${NC}"
    
    # Check for curl
    if ! command -v curl >/dev/null 2>&1; then
        echo -e "${RED}[KAMI] ❌ 'curl' is required but not found. Please install it first.${NC}"
        exit 1
    fi

    # Install NVM
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

    # Load NVM
    hot_load_nvm

    if command -v nvm >/dev/null 2>&1; then
        echo -e "${GREEN}[KAMI] ✓ NVM installed and loaded.${NC}"
        echo -e "${YELLOW}[KAMI] Installing Node.js LTS...${NC}"
        nvm install --lts
        nvm use --lts
        echo -e "${GREEN}[KAMI] ✓ Node.js $(node -v) is now ready.${NC}"
        return 0
    else
        echo -e "${RED}[KAMI] ❌ Failed to load NVM. Please restart terminal and try again.${NC}"
        exit 1
    fi
}

# --- MAIN FLOW ---

# PHASE 1: Prerequisite Verification
echo -e "${YELLOW}[KAMI] Phase 1: Checking prerequisites...${NC}"

# 1.1 Check Git
if command -v git >/dev/null 2>&1; then
    GIT_VER=$(git --version)
    echo -e "${GREEN}[KAMI] ✓ Git: Found ($GIT_VER)${NC}"
else
    echo -e "${RED}[KAMI] ❌ Git: NOT FOUND${NC}"
    echo "       Please install Git package for your OS."
    exit 1
fi

# 1.2 Check Node.js & NVM
if command -v node >/dev/null 2>&1; then
    NODE_VER=$(node -v)
    echo -e "${GREEN}[KAMI] ✓ Node.js: Found ($NODE_VER)${NC}"
else
    echo -e "${YELLOW}[KAMI] ⚠️  Node.js not found in PATH.${NC}"
    
    # Try to detect NVM script source
    NVM_DIR="$HOME/.nvm"
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        echo -e "${CYAN}[KAMI] ℹ️  NVM detected but not loaded. Attempting to load...${NC}"
        hot_load_nvm
        
        if command -v node >/dev/null 2>&1; then
             echo -e "${GREEN}[KAMI] ✓ Node.js found after loading NVM.${NC}"
        else
             echo -e "${YELLOW}[KAMI] ℹ️  NVM loaded but no Node version installed.${NC}"
             echo "       Running 'nvm install --lts'..."
             nvm install --lts
             nvm use --lts
        fi
    else
        echo -e "${RED}[KAMI] ❌ Node.js & NVM: NOT FOUND${NC}"
        echo ""
        read -p "❓ Would you like me to install NVM and Node.js LTS for you? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_nvm_and_node
        else
            echo -e "${RED}[KAMI] Installation cancelled. Please install Node.js manually.${NC}"
            echo -e "       Guide: ${CYAN}https://nodejs.org/${NC}"
            exit 1
        fi
    fi
fi

# PHASE 2: Installation
echo ""
echo -e "${YELLOW}[KAMI] Phase 2: Installing KamiFlow CLI...${NC}"

# Check for sudo requirement (if not using NVM/user-local node)
# If NVM is used, sudo is usually not needed.
if [[ "$(which node)" == "/usr/bin/node" ]] || [[ "$(which node)" == "/usr/local/bin/node" ]]; then
    USE_SUDO="sudo"
    echo -e "${YELLOW}[KAMI] ℹ️  System Node detected. Using 'sudo' for global install.${NC}"
else
    USE_SUDO=""
fi

if $USE_SUDO npm install -g https://github.com/kamishino/gemini-cli-workflow.git; then
    echo -e "${GREEN}[KAMI] ✓ Installation successful!${NC}"
else
    echo -e "${RED}[KAMI] ❌ Installation failed.${NC}"
    exit 1
fi

# PHASE 3: Handshake
echo ""
echo -e "${YELLOW}[KAMI] Phase 3: Verifying installation...${NC}"

if command -v kamiflow >/dev/null 2>&1; then
    VER=$(kamiflow --version)
    echo -e "${GREEN}[KAMI] ✓ KamiFlow CLI is ready ($VER).${NC}"
else
    echo -e "${YELLOW}[KAMI] ⚠️  CLI installed but 'kamiflow' command not found.${NC}"
    echo "       Please restart your terminal or run 'source ~/.bashrc' (or equivalent)."
fi

echo ""
echo -e "${CYAN}========================================================${NC}"
echo -e "${CYAN}  ✅ SETUP COMPLETE${NC}"
echo -e "${CYAN}========================================================${NC}"
echo ""
echo "Next Step: Navigate to your project folder and run:"
echo -e "${GREEN}  kamiflow init${NC}"
echo ""
