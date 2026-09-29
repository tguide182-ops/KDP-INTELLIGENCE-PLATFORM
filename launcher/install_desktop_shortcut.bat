@echo off
setlocal

echo ========================================================
echo   Creating Windows Desktop and Start Menu Shortcuts
echo ========================================================

set TARGET_EXE=d:\antigravity project 1\KDP_Intelligence.exe
set WORK_DIR=d:\antigravity project 1

if not exist "%TARGET_EXE%" (
    echo [ERROR] %TARGET_EXE% does not exist. Please compile it first.
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [System.Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut(\"$desktop\KDP Intelligence.lnk\"); $s.TargetPath = '%TARGET_EXE%'; $s.WorkingDirectory = '%WORK_DIR%'; $s.Description = 'KDP Publishing Intelligence Operating System'; $s.Save(); Write-Host 'Desktop shortcut created at:' \"$desktop\KDP Intelligence.lnk\""

echo.
echo ========================================================
echo   SUCCESS! Shortcut created on your Windows Desktop!
echo ========================================================
