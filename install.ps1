# ========================================================
#   KamiFlow One-Liner Installer (Windows)
# ========================================================

$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  KamiFlow Universal Installer" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# PHASE 1: Prerequisite Verification
Write-Host "[KAMI] Phase 1: Checking prerequisites..." -ForegroundColor Yellow

# Function: Check-Command
function Check-Command ($cmd) {
    try {
        $check = Get-Command $cmd -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# 1.1 Check Git
if (Check-Command "git") {
    $gitVer = git --version
    Write-Host "[KAMI] Found Git: $gitVer" -ForegroundColor Green
} else {
    Write-Host "[KAMI] Error: Git NOT FOUND" -ForegroundColor Red
    Write-Host "       Please install Git for Windows: https://git-scm.com/download/win"
    exit 1
}

# 1.2 Check Node.js & NVM
if (Check-Command "node") {
    $nodeVer = node -v
    Write-Host "[KAMI] Found Node.js: $nodeVer" -ForegroundColor Green
} else {
    Write-Host "[KAMI] Warning: Node.js not found in PATH." -ForegroundColor Yellow
    
    # Check for NVM
    if (Check-Command "nvm") {
        Write-Host "[KAMI] Info: NVM detected but no Node version selected." -ForegroundColor Cyan
        Write-Host "       Attempting to auto-fix..."
        try {
            nvm install lts
            nvm use lts
            Write-Host "[KAMI] Success: Node LTS selected." -ForegroundColor Green
        } catch {
            Write-Host "[KAMI] Error: Auto-fix failed. Please run: 'nvm use lts'" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "[KAMI] Error: Node.js & NVM NOT FOUND" -ForegroundColor Red
        Write-Host "       We recommend installing NVM for Windows:"
        Write-Host "       https://github.com/coreybutler/nvm-windows/releases"
        exit 1
    }
}

# PHASE 2: Installation
Write-Host ""
Write-Host "[KAMI] Phase 2: Installing KamiFlow CLI..." -ForegroundColor Yellow

try {
    Write-Host "       Installing global package from source..." -ForegroundColor Gray
    npm install -g https://github.com/kamishino/gemini-cli-workflow.git
    Write-Host "[KAMI] Success: Installation successful!" -ForegroundColor Green
} catch {
    Write-Host "[KAMI] Error: Installation failed." -ForegroundColor Red
    Write-Host "       Details: $($_.Exception.Message)"
    exit 1
}

# PHASE 3: Handshake
Write-Host ""
Write-Host "[KAMI] Phase 3: Verifying installation..." -ForegroundColor Yellow

try {
    # Using specific executable name to verify path registration
    $ver = kamiflow --version
    Write-Host "[KAMI] Ready: KamiFlow CLI v$ver" -ForegroundColor Green
} catch {
    Write-Host "[KAMI] Warning: CLI installed but 'kamiflow' command not found yet." -ForegroundColor Yellow
    Write-Host "       You may need to restart your terminal."
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Step: Navigate to your project folder and run:"
Write-Host "  kamiflow init" -ForegroundColor Green
Write-Host ""
