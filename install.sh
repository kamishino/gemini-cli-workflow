#!/bin/bash

# ========================================================
#   🌊 KamiFlow One-Liner Installer (Mac/Linux)
# ========================================================

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================================${NC}"
echo -e "${CYAN}  🌊 KamiFlow Universal Installer (Mac/Linux)${NC}"
echo -e "${CYAN}========================================================${NC}"
echo ""

# PHASE 1: Prerequisite Verification
echo -e "${YELLOW}[KAMI] Phase 1: Checking prerequisites...${NC}"

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}[KAMI] ✓ Node.js: Found (${NODE_VERSION})${NC}"
else
    echo -e "${RED}[KAMI] ❌ Node.js: NOT FOUND${NC}"
    echo "       Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

# Check Git
if command -v git >/dev/null 2>&1; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}[KAMI] ✓ Git: Found (${GIT_VERSION})${NC}"
else
    echo -e "${RED}[KAMI] ❌ Git: NOT FOUND${NC}"
    echo "       Please install Git from https://git-scm.com/"
    exit 1
fi

# PHASE 2: Installation
echo ""
echo -e "${YELLOW}[KAMI] Phase 2: Installing KamiFlow to ~/.kami-flow...${NC}"

INSTALL_DIR="$HOME/.kami-flow"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}[KAMI] ⚠️  Existing installation found at $INSTALL_DIR${NC}"
    read -p "       Overwrite existing installation? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}[KAMI] Installation cancelled.${NC}"
        exit 1
    fi
    rm -rf "$INSTALL_DIR"
fi

# Clone Repo
if git clone --depth 1 https://github.com/kamishino/gemini-cli-workflow.git "$INSTALL_DIR"; then
    echo -e "${GREEN}[KAMI] ✓ Repository cloned successfully.${NC}"
else
    echo -e "${RED}[KAMI] ❌ Failed to clone repository.${NC}"
    exit 1
fi

# Install dependencies
cd "$INSTALL_DIR" || exit 1
echo -e "${YELLOW}[KAMI] Installing internal dependencies...${NC}"
if npm install --production; then
    echo -e "${GREEN}[KAMI] ✓ Dependencies installed.${NC}"
else
    echo -e "${RED}[KAMI] ❌ NPM install failed.${NC}"
    exit 1
fi

# PHASE 3: Path Configuration
echo ""
echo -e "${YELLOW}[KAMI] Phase 3: Configuring Shell Environment...${NC}"

BIN_PATH="$INSTALL_DIR/bin"
KAMI_PATH_CMD="export PATH=\"
$PATH:$BIN_PATH\""

# Detect Shell
if [[ "$SHELL" == *"zsh"* ]]; then
    CONFIG_FILE="$HOME/.zshrc"
elif [[ "$SHELL" == *"bash"* ]]; then
    if [ -f "$HOME/.bashrc" ]; then
        CONFIG_FILE="$HOME/.bashrc"
    else
        CONFIG_FILE="$HOME/.bash_profile"
    fi
else
    CONFIG_FILE="$HOME/.profile"
fi

# Check if PATH already exists in config
if grep -q "kami-flow/bin" "$CONFIG_FILE"; then
    echo -e "${GREEN}[KAMI] ✓ PATH already configured in $CONFIG_FILE${NC}"
else
    echo "" >> "$CONFIG_FILE"
    echo "# KamiFlow CLI" >> "$CONFIG_FILE"
    echo "$KAMI_PATH_CMD" >> "$CONFIG_FILE"
    echo -e "${GREEN}[KAMI] ✓ Added PATH to $CONFIG_FILE${NC}"
fi

# PHASE 4: Handshake
echo ""
echo -e "${YELLOW}[KAMI] Phase 4: Verifying installation...${NC}"

# Set path for current session handshake
export PATH="$PATH:$BIN_PATH"

if command -v kami >/dev/null 2>&1; then
    KAMI_VER=$(kami --version)
    echo -e "${GREEN}[KAMI] ✓ KamiFlow CLI is ready (${KAMI_VER}).${NC}"
else
    echo -e "${RED}[KAMI] ❌ Handshake failed. You might need to restart your terminal.${NC}"
fi

echo ""
echo -e "${CYAN}========================================================${NC}"
echo -e "${CYAN}  ✅ SETUP COMPLETE${NC}"
echo -e "${CYAN}========================================================${NC}"
echo ""
echo "Next Steps:"
echo -e "  1. source $CONFIG_FILE (or restart terminal)"
echo -e "  2. Go to your project and run: ${GREEN}kami init${NC}"
echo ""
