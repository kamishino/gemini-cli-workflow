@echo off
echo ========================================================
echo   🌊 Welcome to KamiFlow - The Indie Builder's OS
echo ========================================================
echo.
echo [!] Remember to start with: /kamiflow:input [Idea]
echo [!] When finishing a task in IDE, run: /kamiflow:sync
echo [!] Before closing, ALWAYS run: /kamiflow:save-context
echo.
echo Starting Gemini CLI...
gemini chat
echo.
echo ========================================================
echo   Session Ended. Did you save context?
echo ========================================================
pause
