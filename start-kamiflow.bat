@echo off
setlocal enabledelayedexpansion

:: ========================================================
::   🌊 KamiFlow Universal Bootstrapper v2.8
:: ========================================================

:: SELF-RELOCATION LOGIC
:: Check if we are running from inside the submodule directory
set "SCRIPT_DIR=%~dp0"
set "PARENT_DIR=%~dp0.."
if "%SCRIPT_DIR:~-11%"==".kami-flow\" (
    echo [!] Running from inside .kami-flow submodule.
    echo [→] Relocating bootstrapper to project root...
    copy /Y "%~f0" "%SCRIPT_DIR%..\start-kamiflow.bat" >nul
    echo [✓] Bootstrapper relocated.
    echo [→] Launching from root...
    cd ..
    start "" "start-kamiflow.bat"
    exit /b 0
)

echo ========================================================
echo   🌊 KamiFlow Universal Bootstrapper v2.8
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
    if not exist ".gemini" (
        echo [!] KamiFlow submodule not found.
        echo.
        set /p ADD_SUBMODULE="[?] Add KamiFlow as submodule? (Y/N): "
        if /i "!ADD_SUBMODULE!"=="Y" (
            echo.
            echo Please provide the KamiFlow repository URL:
            set /p REPO_URL="Repository URL (Default: https://github.com/kamishino/gemini-cli-workflow): "
            if "!REPO_URL!"=="" set "REPO_URL=https://github.com/kamishino/gemini-cli-workflow"
            echo.
            echo [→] Adding KamiFlow submodule...
            git submodule add !REPO_URL! .kami-flow
            if %errorlevel% neq 0 (
                echo [✗] Failed to add submodule.
            ) else (
                git submodule update --init --recursive
                echo [✓] Submodule added successfully.
                echo.
            )
        )
    )
)

:: ========================================================
:: PHASE 4: Integration Strategy
:: ========================================================

if exist ".gemini" (
    echo [✓] KamiFlow portals found.
    goto :LAUNCH
)

if exist ".kami-flow" (
    echo ========================================================
    echo   SELECT INTEGRATION MODE
    echo ========================================================
    echo  1. Linked Submodule (Recommended)
    echo     - Keeps core logic in .kami-flow
    echo     - Uses symbolic links for root visibility
    echo     - Allows easy updates from core repository
    echo.
    echo  2. Standalone Copy (Clean)
    echo     - Copies all files physically to root
    echo     - Removes all Git submodule links and .kami-flow folder
    echo     - Ideal for independent, customized projects
    echo ========================================================
    set /p CHOICE="Choose mode (1 or 2): "

    if "!CHOICE!"=="2" (
        echo [→] Entering Standalone Mode (Copy & Cut)...
        echo.
        :: Physical Copy
        xcopy /E /I /Y /Q ".kami-flow\.gemini" ".gemini" >nul
        xcopy /E /I /Y /Q ".kami-flow\.windsurf" ".windsurf" >nul
        if not exist "docs" mkdir docs
        xcopy /E /I /Y /Q ".kami-flow\docs\protocols" "docs\protocols" >nul
        copy /Y ".kami-flow\docs\overview.md" "docs\overview.md" >nul
        copy /Y ".kami-flow\GEMINI.md" "GEMINI.md" >nul
        if exist ".kami-flow\docs\templates\context.md" copy /Y ".kami-flow\docs\templates\context.md" "PROJECT_CONTEXT.md" >nul
        if exist ".kami-flow\docs\templates\roadmap.md" copy /Y ".kami-flow\docs\templates\roadmap.md" "docs\roadmap.md" >nul
        
        :: Git Sculpting - Cuttin the cord
        echo [→] Removing submodule metadata...
        git submodule deinit -f .kami-flow >nul 2>&1
        git rm -f .kami-flow >nul 2>&1
        rmdir /S /Q ".kami-flow" >nul 2>&1
        if exist ".gitmodules" del /F /Q ".gitmodules" >nul 2>&1
        rmdir /S /Q ".git\modules\.kami-flow" >nul 2>&1
        
        echo [✓] Standalone integration complete. Submodule removed.
        goto :LAUNCH
    )

    :: Mode 1: Linked Submodule (Default)
    echo [→] Setting up Linked Portal Network...
    
    :: Attempt symlink creation
    powershell -NoProfile -ExecutionPolicy Bypass -Command "& { try { New-Item -ItemType SymbolicLink -Path '.gemini' -Target '.kami-flow\.gemini' -ErrorAction Stop | Out-Null; exit 0 } catch { exit 1 } }"
    
    if %errorlevel% equ 0 (
        powershell -NoProfile -ExecutionPolicy Bypass -Command "& { try { New-Item -ItemType SymbolicLink -Path '.windsurf' -Target '.kami-flow\.windsurf' -ErrorAction Stop | Out-Null; exit 0 } catch { exit 1 } }"
        if not exist "docs" mkdir docs
        powershell -NoProfile -ExecutionPolicy Bypass -Command "& { try { New-Item -ItemType SymbolicLink -Path 'docs\protocols' -Target '.kami-flow\docs\protocols' -ErrorAction Stop | Out-Null; exit 0 } catch { exit 1 } }"
        powershell -NoProfile -ExecutionPolicy Bypass -Command "& { try { New-Item -ItemType SymbolicLink -Path 'docs\overview.md' -Target '.kami-flow\docs\overview.md' -ErrorAction Stop | Out-Null; exit 0 } catch { exit 1 } }"
        
        :: Proxy GEMINI.md
        if not exist "GEMINI.md" (
            echo ^<!-- Imported from: .kami-flow/GEMINI.md --^> > GEMINI.md
            echo # Project-Specific Customizations >> GEMINI.md
        )
        if not exist "PROJECT_CONTEXT.md" (
            if exist ".kami-flow\docs\templates\context.md" copy /Y ".kami-flow\docs\templates\context.md" "PROJECT_CONTEXT.md" >nul
        )
        if not exist "docs\roadmap.md" (
            if exist ".kami-flow\docs\templates\roadmap.md" copy /Y ".kami-flow\docs\templates\roadmap.md" "docs\roadmap.md" >nul
        )
        
        :: Ignore .kami-flow
        echo .kami-flow/ >> .geminiignore
        echo [✓] Linked Portal Network activated.
        echo [!] NOTE: Keep the .kami-flow folder to receive core updates.
    ) else (
        echo [✗] Symlink creation failed (Permission Denied).
        echo [?] Falling back to Embed Mode (Physical Copy)...
        :: Re-use standalone copy logic but keep submodule
        xcopy /E /I /Y /Q ".kami-flow\.gemini" ".gemini" >nul
        xcopy /E /I /Y /Q ".kami-flow\.windsurf" ".windsurf" >nul
        if not exist "docs" mkdir docs
        xcopy /E /I /Y /Q ".kami-flow\docs\protocols" "docs\protocols" >nul
        copy /Y ".kami-flow\docs\overview.md" "docs\overview.md" >nul
        copy /Y ".kami-flow\GEMINI.md" "GEMINI.md" >nul
        if exist ".kami-flow\docs\templates\context.md" copy /Y ".kami-flow\docs\templates\context.md" "PROJECT_CONTEXT.md" >nul
        if exist ".kami-flow\docs\templates\roadmap.md" copy /Y ".kami-flow\docs\templates\roadmap.md" "docs\roadmap.md" >nul
        echo [✓] Embed Mode complete (Standalone copy).
    )
)

:LAUNCH
echo.
echo [→] Launching Gemini CLI...
gemini chat
pause