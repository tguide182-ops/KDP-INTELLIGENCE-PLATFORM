@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   Compiling KDP Intelligence Native Windows Executable
echo ========================================================

set CSC_PATH=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe
if not exist "%CSC_PATH%" (
    set CSC_PATH=C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe
)

if not exist "%CSC_PATH%" (
    echo [ERROR] Could not find .NET Framework csc.exe compiler.
    exit /b 1
)

echo Using C# Compiler: %CSC_PATH%
echo Target: KDP_Intelligence.exe

"%CSC_PATH%" /target:winexe /optimize+ /platform:anycpu /out:"d:\antigravity project 1\KDP_Intelligence.exe" "d:\antigravity project 1\launcher\KDP_Intelligence.cs"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! KDP_Intelligence.exe compiled successfully!
    echo   Location: d:\antigravity project 1\KDP_Intelligence.exe
    echo ========================================================
) else (
    echo [ERROR] Compilation failed with error code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)
