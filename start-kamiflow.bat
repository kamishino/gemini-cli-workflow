@echo off
setlocal enabledelayedexpansion

:: ========================================================
::   🌊 KamiFlow Universal Bootstrapper v2.9
:: ========================================================

:: Logic check for jump
if defined KAMI_JUMPED goto :CHECK_DEPENDENCIES

:: SELF-RELOCATION LOGIC (Same Window)
set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-11%"==".kami-flow\" (
    echo [KAMI] Running from submodule. Relocating to root...
    copy /Y "%~f0" "%SCRIPT_DIR%..\start-kamiflow.bat" >nul
    cd ..
    set "KAMI_JUMPED=true"
    call ".\start-kamiflow.bat"
    exit /b 0
)

:CHECK_DEPENDENCIES
echo ========================================================
echo   🌊 KamiFlow Universal Bootstrapper v2.9
echo ========================================================
echo.

:: PHASE 1: Dependency Check
where gemini >nul 2>&1
if %errorlevel% neq 0 (
    echo [KAMI] [!] Gemini CLI not found.
    set /p INSTALL_GEMINI="[?] Install Gemini CLI now via npm? (Y/N): "
    if /i "!INSTALL_GEMINI!"=="Y" (
        echo [KAMI] Installing @google/gemini-cli...
        npm install -g @google/gemini-cli
        if %errorlevel% neq 0 (
            echo [KAMI] [X] Installation failed. Please install manually: https://geminicli.com/
            pause
            exit /b 1
        )
        echo [KAMI] [V] Gemini CLI installed successfully.
    ) else (
        echo [KAMI] Please install Gemini CLI manually to continue.
        pause
        exit /b 1
    )
)

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [KAMI] [X] Git not found. Please install Git for Windows.
    pause
    exit /b 1
)

:: PHASE 2: Git Setup
if not exist ".git" (
    set /p INIT_GIT="[KAMI] [?] No Git repo. Initialize now? (Y/N): "
    if /i "!INIT_GIT!"=="Y" (
        git init >nul
        echo [KAMI] [V] Git repo initialized.
    )
)

:: PHASE 3: Submodule Handling
if not exist ".kami-flow" (
    if not exist ".gemini" (
        set /p ADD_SUB="[KAMI] [?] Add KamiFlow as submodule? (Y/N): "
        if /i "!ADD_SUB!"=="Y" (
            set /p REPO_URL="[KAMI] Repo URL (Enter for default): "
            if "!REPO_URL!"=="" set "REPO_URL=https://github.com/kamishino/gemini-cli-workflow"
            git submodule add !REPO_URL! .kami-flow >nul
            git submodule update --init --recursive >nul
            echo [KAMI] [V] Submodule added.
        )
    )
)

:: PHASE 4: Integration
if exist ".gemini" (
    echo [KAMI] Portals confirmed.
    goto :LAUNCH
)

if exist ".kami-flow" (
    echo ========================================================
    echo   SELECT INTEGRATION
    echo ========================================================
    echo  1. Linked Submodule (Recommended)
    echo  2. Standalone Copy (Clean)
    echo ========================================================
    set /p CHOICE="Choice (1 or 2): "

    if "!CHOICE!"=="2" (
        echo [KAMI] Copying files...
        xcopy /E /I /Y /Q ".kami-flow\.gemini" ".gemini" >nul
        xcopy /E /I /Y /Q ".kami-flow\.windsurf" ".windsurf" >nul
        if not exist "docs" mkdir docs
        xcopy /E /I /Y /Q ".kami-flow\docs\protocols" "docs\protocols" >nul
        copy /Y ".kami-flow\docs\overview.md" "docs\overview.md" >nul
        copy /Y ".kami-flow\GEMINI.md" "GEMINI.md" >nul
        if exist ".kami-flow\docs\templates\context.md" copy /Y ".kami-flow\docs\templates\context.md" "PROJECT_CONTEXT.md" >nul
        if exist ".kami-flow\docs\templates\roadmap.md" copy /Y ".kami-flow\docs\templates\roadmap.md" "docs\roadmap.md" >nul
        
        echo [KAMI] Detaching submodule...
        git submodule deinit -f .kami-flow >nul 2>&1
        git rm -f .kami-flow >nul 2>&1
        rmdir /S /Q ".kami-flow" >nul 2>&1
        if exist ".gitmodules" del /F /Q ".gitmodules" >nul 2>&1
        rmdir /S /Q ".git\modules\.kami-flow" >nul 2>&1
        echo [KAMI] [V] Standalone setup complete.
        goto :LAUNCH
    )

    :: Linked Mode
    echo [KAMI] Creating Portals...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "& { New-Item -ItemType SymbolicLink -Path '.gemini' -Target '.kami-flow\.gemini' -ErrorAction SilentlyContinue | Out-Null }"
    powershell -NoProfile -ExecutionPolicy Bypass -Command "& { New-Item -ItemType SymbolicLink -Path '.windsurf' -Target '.kami-flow\.windsurf' -ErrorAction SilentlyContinue | Out-Null }"
    if not exist "docs" mkdir docs
    powershell -NoProfile -ExecutionPolicy Bypass -Command "& { New-Item -ItemType SymbolicLink -Path 'docs\protocols' -Target '.kami-flow\docs\protocols' -ErrorAction SilentlyContinue | Out-Null }"
    powershell -NoProfile -ExecutionPolicy Bypass -Command "& { New-Item -ItemType SymbolicLink -Path 'docs\overview.md' -Target '.kami-flow\docs\overview.md' -ErrorAction SilentlyContinue | Out-Null }"
    
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
    echo .kami-flow/ >> .geminiignore
    echo [KAMI] [V] Portals activated.
)

:LAUNCH
echo [KAMI] Starting Gemini...
echo.
gemini
pause
