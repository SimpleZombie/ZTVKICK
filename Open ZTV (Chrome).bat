@echo off
rem Opens ZTV in its own Chrome window with sound on from the start.
rem It uses a separate Chrome profile, so it works even if Chrome is already open.
set "Z=%~dp0index.html"
set "U=%Z:\=/%"
set "C=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%C%" set "C=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%C%" set "C=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not exist "%C%" (echo Could not find Chrome. & pause & exit /b)
start "" "%C%" --user-data-dir="%LocalAppData%\ZTV-Chrome" --autoplay-policy=no-user-gesture-required --no-first-run --no-default-browser-check --start-fullscreen --app="file:///%U%"
