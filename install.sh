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

INSTALL_DIR="$HOME/.kami-flow"
REPO_URL="https://github.com/kamishino/gemini-cli-workflow.git"

# PHASE 1: Prerequisite Verification
echo -e "${YELLOW}[KAMI] Phase 1: Checking prerequisites...${NC}"

if ! command -v git >/dev/null 2>&1; then
    echo -e "${RED}[KAMI] ❌ Git: NOT FOUND. Please install Git.${NC}"
    exit 1
fi

if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}[KAMI] ❌ Node.js: NOT FOUND. Please install Node.js.${NC}"
    exit 1
fi

# PHASE 2: Installation (Clone & Build)
echo ""
echo -e "${YELLOW}[KAMI] Phase 2: Installing KamiFlow to $INSTALL_DIR...${NC}"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${GRAY}       Updating existing installation...${NC}"
    cd "$INSTALL_DIR" || exit
    git pull
else
    echo -e "${GRAY}       Cloning repository...${NC}"
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR" || exit
fi

echo -e "${GRAY}       Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}       Building distribution artifacts...${NC}"
npm run build

echo -e "${GRAY}       Linking globally...${NC}"
# Use sudo if necessary for global link
if [[ "$(which node)" == "/usr/bin/node" ]]; then
    sudo npm install -g .
else
    npm install -g .
fi

# PHASE 3: Handshake & Alias
echo ""
echo -e "${YELLOW}[KAMI] Phase 3: Setting permanent alias...${NC}"

setup_alias() {
    local alias_line="alias kami='kamiflow'"
    local target_file=""

    if [[ "$SHELL" == *"zsh"* ]]; then
        target_file="$HOME/.zshrc"
    elif [[ "$SHELL" == *"bash"* ]]; then
        target_file="$HOME/.bashrc"
    fi

    if [ -n "$target_file" ]; then
        if ! grep -q "alias kami=" "$target_file"; then
            echo -e "\n# KamiFlow Alias\n$alias_line" >> "$target_file"
            echo -e "${GREEN}[KAMI] ✓ Permanent alias 'kami' added to $target_file.${NC}"
        fi
    fi
}

setup_alias

echo ""
echo -e "${CYAN}========================================================${NC}"
echo -e "${CYAN}  ✅ SETUP COMPLETE${NC}"
echo -e "${CYAN}========================================================${NC}"
echo ""
echo -e "Next Step: RESTART your terminal or run ${YELLOW}'source ~/.bashrc'${NC} (or .zshrc) to enable 'kami'."
echo "Then, navigate to your project folder and run:"
echo -e "${GREEN}  kami init${NC}"
echo ""