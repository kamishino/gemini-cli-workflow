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
        echo -e "${CYAN}[KAMI] ℹ️  NVM detected. Attempting to load...${NC}"
        source "$NVM_DIR/nvm.sh"
        
        # Try to install/use LTS
        echo "       Running 'nvm install --lts'..."
        if nvm install --lts; then
             nvm use --lts
             echo -e "${GREEN}[KAMI] ✓ Auto-fix successful. Node LTS selected.${NC}"
        else
             echo -e "${RED}[KAMI] ❌ Auto-fix failed. Please install Node manually.${NC}"
             exit 1
        fi
    else
        echo -e "${RED}[KAMI] ❌ Node.js & NVM: NOT FOUND${NC}"
        echo -e "       We recommend installing NVM with this command:"
        echo -e "       ${CYAN}curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash${NC}"
        exit 1
    fi
fi

# PHASE 2: Installation
echo ""
echo -e "${YELLOW}[KAMI] Phase 2: Installing KamiFlow CLI...${NC}"

# Check for sudo requirement (if not using NVM/user-local node)
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
    echo "       Please restart your terminal."
fi

echo ""
echo -e "${CYAN}========================================================${NC}"
echo -e "${CYAN}  ✅ SETUP COMPLETE${NC}"
echo -e "${CYAN}========================================================${NC}"
echo ""
echo "Next Step: Navigate to your project folder and run:"
echo -e "${GREEN}  kamiflow init${NC}"
echo ""