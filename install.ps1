# ========================================================
#   KamiFlow One-Liner Installer (Windows)
# ========================================================

$OutputEncoding = [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  KamiFlow Universal Installer" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$INSTALL_DIR = Join-Path $HOME ".kami-flow"
$REPO_URL = "https://github.com/kamishino/gemini-cli-workflow.git"

# PHASE 1: Prerequisite Verification
Write-Host "[KAMI] Phase 1: Checking prerequisites..." -ForegroundColor Yellow

function Check-Command ($cmd) {
    try {
        $check = Get-Command $cmd -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

if (!(Check-Command "git")) {
    Write-Host "[KAMI] Error: Git NOT FOUND. Please install Git: https://git-scm.com/" -ForegroundColor Red
    exit 1
}

if (!(Check-Command "node")) {
    Write-Host "[KAMI] Error: Node.js NOT FOUND. Please install Node.js: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# PHASE 2: Installation (Clone & Build)
Write-Host ""
Write-Host "[KAMI] Phase 2: Installing KamiFlow to $INSTALL_DIR..." -ForegroundColor Yellow

try {
    if (Test-Path $INSTALL_DIR) {
        Write-Host "       Updating existing installation..." -ForegroundColor Gray
        Set-Location $INSTALL_DIR
        git pull
    } else {
        Write-Host "       Cloning repository..." -ForegroundColor Gray
        git clone $REPO_URL $INSTALL_DIR
        Set-Location $INSTALL_DIR
    }

    Write-Host "       Installing dependencies..." -ForegroundColor Gray
    npm install

    Write-Host "       Building distribution artifacts..." -ForegroundColor Yellow
    npm run build

    Write-Host "       Linking globally..." -ForegroundColor Gray
    npm install -g .
    
    Write-Host "[KAMI] Success: Installation successful!" -ForegroundColor Green
} catch {
    Write-Host "[KAMI] Error: Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# PHASE 3: Handshake & Alias
Write-Host ""
Write-Host "[KAMI] Phase 3: Setting permanent alias..." -ForegroundColor Yellow

try {
    $aliasName = "kami"
    $aliasCmd = "kamiflow"
    $profileDir = Split-Path $PROFILE
    if (!(Test-Path $profileDir)) { New-Item -ItemType Directory -Path $profileDir -Force | Out-Null }
    if (!(Test-Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force | Out-Null }

    $profileContent = Get-Content $PROFILE -Raw
    $aliasBlock = "`n# KamiFlow Alias`nfunction $aliasName { kamiflow `$args }"
    
    if ($profileContent -notmatch "function $aliasName") {
        Add-Content -Path $PROFILE -Value $aliasBlock
        Write-Host "[KAMI] Success: Permanent alias '$aliasName' added to your profile." -ForegroundColor Green
    }
} catch {
    Write-Host "[KAMI] Warning: Failed to set permanent alias automatically." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Step: RESTART your terminal or run '. `$PROFILE' to enable 'kami'." -ForegroundColor Yellow
Write-Host "Then, navigate to your project folder and run:"
Write-Host "  kami init" -ForegroundColor Green
Write-Host ""