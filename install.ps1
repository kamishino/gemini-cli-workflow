# ========================================================
#   🌊 KamiFlow One-Liner Installer
# ========================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  🌊 KamiFlow Universal Installer" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# PHASE 1: Prerequisite Verification
Write-Host "[KAMI] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "[KAMI] ✓ Node.js: Found ($nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "[KAMI] ❌ Node.js: NOT FOUND" -ForegroundColor Red
    Write-Host "       Please install Node.js 16+ from https://nodejs.org/"
    exit 1
}

# Check Git
try {
    $gitVersion = git --version
    Write-Host "[KAMI] ✓ Git: Found ($gitVersion)" -ForegroundColor Green
} catch {
    Write-Host "[KAMI] ❌ Git: NOT FOUND" -ForegroundColor Red
    Write-Host "       Please install Git for Windows from https://git-scm.com/"
    exit 1
}

# PHASE 2: Installation
Write-Host ""
Write-Host "[KAMI] Installing KamiFlow CLI from GitHub..." -ForegroundColor Yellow

try {
    npm install -g https://github.com/kamishino/gemini-cli-workflow.git
    Write-Host "[KAMI] ✓ Installation successful!" -ForegroundColor Green
} catch {
    Write-Host "[KAMI] ❌ Installation failed." -ForegroundColor Red
    exit 1
}

# PHASE 3: Handshake
Write-Host ""
Write-Host "[KAMI] Verifying installation..." -ForegroundColor Yellow

try {
    # We use the full command name first to ensure it's registered
    gemini-cli-kamiflow --version
    Write-Host "[KAMI] ✓ KamiFlow CLI is ready." -ForegroundColor Green
} catch {
    Write-Host "[KAMI] ⚠️  CLI registered but might need a terminal restart." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  ✅ SETUP COMPLETE" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Step: Navigate to your project and run:"
Write-Host "  kami init" -ForegroundColor Green
Write-Host ""
