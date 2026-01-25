@echo off
setlocal enabledelayedexpansion

:: ========================================================
::   🌊 KamiFlow Universal Bootstrapper v2.7
:: ========================================================

echo ========================================================
echo   🌊 KamiFlow Universal Bootstrapper v2.7
echo ========================================================
echo.

:: ========================================================
:: PHASE 1: Environment Validation
:: ========================================================

echo [Checking Environment...]

:: Check for Gemini CLI
where gemini >nul 2>&1
if %errorlevel% neq 0 (
    echo [✗] Gemini CLI: NOT FOUND
    echo.
    echo ERROR: Gemini CLI is required but not installed.
    echo.
    echo Installation Instructions:
    echo   1. Visit: https://geminicli.com/
    echo   2. Install via npm: npm install -g @google/gemini-cli
    echo   3. Configure API key: gemini config set apiKey YOUR_API_KEY
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)
echo [✓] Gemini CLI: Found

:: Check for Git
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [✗] Git: NOT FOUND
    echo.
    echo ERROR: Git is required but not installed.
    echo.
    echo Installation Instructions:
    echo   1. Visit: https://git-scm.com/download/win
    echo   2. Download and install Git for Windows
    echo   3. Restart your terminal after installation
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)
echo [✓] Git: Found
echo.

:: ========================================================
:: PHASE 2: Git Repository Setup
:: ========================================================

:: Check if this is a Git repository
if not exist ".git" (
    echo [!] WARNING: No Git repository detected
    echo.
    set /p INIT_GIT="[?] Initialize Git repository? (Y/N): "
    if /i "!INIT_GIT!"=="Y" (
        echo.
        echo [→] Initializing Git repository...
        git init
        if %errorlevel% neq 0 (
            echo [✗] Failed to initialize Git repository
            pause
            exit /b 1
        )
        echo [✓] Git repository initialized
        echo.
    ) else (
        echo [!] Skipping Git initialization
        echo [!] WARNING: Some features may not work without Git
        echo.
    )
)

:: ========================================================
:: PHASE 3: Submodule Check
:: ========================================================

if not exist ".kami-flow" (
    echo [!] KamiFlow submodule not found
    echo.
    echo This script works best with KamiFlow as a submodule.
    echo However, if you're running from the KamiFlow repo itself,
    echo the AI commands should work directly.
    echo.
    set /p ADD_SUBMODULE="[?] Add KamiFlow as submodule? (Y/N): "
    if /i "!ADD_SUBMODULE!"=="Y" (
        echo.
        echo Please provide the KamiFlow repository URL:
        set /p REPO_URL="Repository URL: "
        echo.
        echo [→] Adding KamiFlow submodule...
        git submodule add !REPO_URL! .kami-flow
        if %errorlevel% neq 0 (
            echo [✗] Failed to add submodule
            echo.
            echo You can add it manually later with:
            echo   git submodule add [REPO_URL] .kami-flow
            echo.
        ) else (
            git submodule update --init --recursive
            echo [✓] Submodule added successfully
            echo.
        )
    ) else (
        echo [!] Continuing without submodule
        echo.
    )
)

:: ========================================================
:: PHASE 4: Portal Network Setup
:: ========================================================

:: Check if portals already exist
if exist ".gemini" (
    echo [✓] Portal network already configured
    goto :LAUNCH
)

:: If .kami-flow exists, set up portal network
if exist ".kami-flow" (
    echo [→] Setting up Portal Network...
    echo.
    
    :: Attempt symlink creation via PowerShell
    echo [→] Attempting to create symbolic links...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "& { try { New-Item -ItemType SymbolicLink -Path '.gemini' -Target '.kami-flow\.gemini' -ErrorAction Stop | Out-Null; exit 0 } catch { exit 1 } }"
    
    if %errorlevel% equ 0 (
        :: Symlink succeeded - create remaining portals
        echo [✓] Created .gemini/ portal
        
        powershell -NoProfile -ExecutionPolicy Bypass -Command "& { try { New-Item -ItemType SymbolicLink -Path '.windsurf' -Target '.kami-flow\.windsurf' -ErrorAction Stop | Out-Null; exit 0 } catch { exit 1 } }"
        echo [✓] Created .windsurf/ portal
        
        :: Create docs directory if needed
        if not exist "docs" mkdir docs
        
        powershell -NoProfile -ExecutionPolicy Bypass -Command "& { try { New-Item -ItemType SymbolicLink -Path 'docs\protocols' -Target '.kami-flow\docs\protocols' -ErrorAction Stop | Out-Null; exit 0 } catch { exit 1 } }"
        echo [✓] Created docs/protocols/ portal
        
        powershell -NoProfile -ExecutionPolicy Bypass -Command "& { try { New-Item -ItemType SymbolicLink -Path 'docs\overview.md' -Target '.kami-flow\docs\overview.md' -ErrorAction Stop | Out-Null; exit 0 } catch { exit 1 } }"
        echo [✓] Created docs/overview.md portal
        
        :: Seed proxy files
        if not exist "GEMINI.md" (
            echo ^<!-- Imported from: .kami-flow/GEMINI.md --^> > GEMINI.md
            echo ^<!-- This file is a PROXY. Add project-specific rules below. --^> >> GEMINI.md
            echo. >> GEMINI.md
            echo # Project-Specific Customizations ^(Optional^) >> GEMINI.md
            echo [✓] Created GEMINI.md proxy
        )
        
        :: Seed PROJECT_CONTEXT.md from template
        if not exist "PROJECT_CONTEXT.md" (
            if exist ".kami-flow\docs\templates\context.md" (
                copy /Y ".kami-flow\docs\templates\context.md" "PROJECT_CONTEXT.md" >nul
                echo [✓] Created PROJECT_CONTEXT.md from template
            )
        )
        
        :: Seed docs/roadmap.md from template
        if not exist "docs\roadmap.md" (
            if exist ".kami-flow\docs\templates\roadmap.md" (
                copy /Y ".kami-flow\docs\templates\roadmap.md" "docs\roadmap.md" >nul
                echo [✓] Created docs/roadmap.md from template
            )
        )
        
        :: Configure .geminiignore
        if not exist ".geminiignore" (
            echo. > .geminiignore
            echo # Ignore submodule ^(accessed via symlinks^) >> .geminiignore
            echo .kami-flow/ >> .geminiignore
            echo [✓] Created .geminiignore
        ) else (
            findstr /C:".kami-flow/" .geminiignore >nul 2>&1
            if %errorlevel% neq 0 (
                echo. >> .geminiignore
                echo # Ignore submodule ^(accessed via symlinks^) >> .geminiignore
                echo .kami-flow/ >> .geminiignore
                echo [✓] Updated .geminiignore
            )
        )
        
        echo.
        echo [✓] Portal Network activated successfully!
        echo.
        
    ) else (
        :: Symlink failed - offer Embed Mode
        echo [✗] Symlink creation failed ^(Permission Denied^)
        echo.
        echo Windows requires special permissions for symbolic links.
        echo.
        echo SOLUTIONS:
        echo   1. Run as Administrator ^(Right-click terminal -^> Run as Administrator^)
        echo   2. Enable Developer Mode in Windows Settings
        echo   3. Use Embed Mode ^(Physical copy - no auto-updates^)
        echo.
        set /p EMBED_MODE="[?] Switch to Embed Mode (Copying files physically)? (Y/N): "
        
        if /i "!EMBED_MODE!"=="Y" (
            echo.
            echo [→] Entering Embed Mode...
            echo [!] This will copy KamiFlow files to your project root
            echo.
            
            :: Copy core directories
            if exist ".kami-flow\.gemini" (
                xcopy /E /I /Y /Q ".kami-flow\.gemini" ".gemini" >nul
                echo [✓] Copied .gemini/
            )
            
            if exist ".kami-flow\.windsurf" (
                xcopy /E /I /Y /Q ".kami-flow\.windsurf" ".windsurf" >nul
                echo [✓] Copied .windsurf/
            )
            
            :: Copy documentation
            if not exist "docs" mkdir docs
            if exist ".kami-flow\docs\protocols" (
                xcopy /E /I /Y /Q ".kami-flow\docs\protocols" "docs\protocols" >nul
                echo [✓] Copied docs/protocols/
            )
            
            if exist ".kami-flow\docs\overview.md" (
                copy /Y ".kami-flow\docs\overview.md" "docs\overview.md" >nul
                echo [✓] Copied docs/overview.md
            )
            
            :: Copy GEMINI.md as base (not proxy)
            if not exist "GEMINI.md" (
                if exist ".kami-flow\GEMINI.md" (
                    copy /Y ".kami-flow\GEMINI.md" "GEMINI.md" >nul
                    echo [✓] Copied GEMINI.md
                )
            )
            
            :: Seed project files
            if not exist "PROJECT_CONTEXT.md" (
                if exist ".kami-flow\docs\templates\context.md" (
                    copy /Y ".kami-flow\docs\templates\context.md" "PROJECT_CONTEXT.md" >nul
                    echo [✓] Created PROJECT_CONTEXT.md from template
                )
            )
            
            if not exist "docs\roadmap.md" (
                if exist ".kami-flow\docs\templates\roadmap.md" (
                    copy /Y ".kami-flow\docs\templates\roadmap.md" "docs\roadmap.md" >nul
                    echo [✓] Created docs/roadmap.md from template
                )
            )
            
            :: Remove submodule directory
            echo [→] Cleaning up submodule directory...
            rmdir /S /Q ".kami-flow" >nul 2>&1
            echo [✓] Removed .kami-flow/ directory
            
            :: Update .gitignore to exclude setup artifacts
            if not exist ".gitignore" (
                echo .kami-flow/ > .gitignore
            ) else (
                findstr /C:".kami-flow/" .gitignore >nul 2>&1
                if %errorlevel% neq 0 (
                    echo .kami-flow/ >> .gitignore
                )
            )
            
            echo.
            echo [✓] Embed Mode setup complete!
            echo [!] NOTE: You're now using a standalone copy
            echo [!] Updates must be applied manually
            echo.
            
        ) else (
            echo.
            echo [!] Setup cancelled
            echo [!] You can run this script again after fixing permissions
            echo.
            pause
            exit /b 1
        )
    )
) else (
    :: No submodule, assume we're in the KamiFlow repo itself
    echo [!] Running from KamiFlow repository
    echo [!] Commands should work directly
    echo.
)

:: ========================================================
:: PHASE 5: Launch Gemini CLI
:: ========================================================

:LAUNCH
echo ========================================================
echo   🚀 Launching Gemini CLI
echo ========================================================
echo.
echo [!] Quick Tips:
echo   - Start with: /kamiflow:wake
echo   - Create ideas: /kamiflow:idea "Your feature"
echo   - After IDE work: /kamiflow:sync
echo   - Before closing: /kamiflow:save-context
echo.
echo Starting Gemini CLI...
echo.

gemini chat

echo.
echo ========================================================
echo   Session Ended. Did you save context?
echo ========================================================
pause
