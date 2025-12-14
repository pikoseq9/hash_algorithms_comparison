@echo off

REM Sprawdzenie czy podano argument
if "%~1"=="" (
    echo Podaj tekst do hashowania!
    echo Przyklad: benchmark.bat "ala ma kota" SHA1 CSharp
    exit /b 1
)

set inputText=%~1

REM Domyslnie SHA1 i CSharp
set hashType=SHA1
if not "%~2"=="" set hashType=%~2

set lang=CSharp
if not "%~3"=="" set lang=%~3

REM Wywolanie PowerShell
powershell -ExecutionPolicy Bypass -File benchmark.ps1 "%inputText%" "%hashType%" "%lang%"
