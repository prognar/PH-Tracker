@echo off
REM Pizza Hut Tracker - Windows Update Script
REM Run this via Task Scheduler for daily updates
REM 
REM To set up Task Scheduler:
REM 1. Open Task Scheduler (search "Task Scheduler" in Start)
REM 2. Click "Create Basic Task"
REM 3. Name: "Pizza Hut Tracker Update"
REM 4. Trigger: Daily, pick your preferred time (e.g., 8:00 AM)
REM 5. Action: Start a program
REM 6. Program: Browse to this update.bat file
REM 7. Start in: Set to your project folder (e.g., C:\Users\YourName\PH-Tracker)
REM 8. Finish

cd /d "%~dp0"

echo ========================================
echo Pizza Hut Tracker - Daily Update
echo %date% %time%
echo ========================================

REM Run the update script
call npm run update

REM Check if data.json changed
git diff --quiet src/data.json
if %errorlevel% neq 0 (
    echo.
    echo Changes detected, pushing to GitHub...
    git add src/data.json
    git commit -m "🍕 Daily tracker update - %date%"
    git push origin main
    echo.
    echo ✅ Update pushed to GitHub!
) else (
    echo.
    echo No changes to push.
)

echo.
echo Done!
pause
