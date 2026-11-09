@echo off
rem Opens ZTV full screen in its own Firefox window with sound on from the start.
rem Uses a separate Firefox profile, so your normal Firefox and its settings are untouched,
rem and it works even if Firefox is already open. Press Alt+F4 to close ZTV.
set "Z=%~dp0index.html"
set "U=%Z:\=/%"
set "F=%ProgramFiles%\Mozilla Firefox\firefox.exe"
if not exist "%F%" set "F=%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe"
if not exist "%F%" set "F=%LocalAppData%\Mozilla Firefox\firefox.exe"
if not exist "%F%" (echo Could not find Firefox. & pause & exit /b)
set "P=%LocalAppData%\ZTV-Firefox"
if not exist "%P%" mkdir "%P%"
> "%P%\user.js" echo user_pref("media.autoplay.default", 0);
>>"%P%\user.js" echo user_pref("media.autoplay.blocking_policy", 0);
>>"%P%\user.js" echo user_pref("browser.shell.checkDefaultBrowser", false);
>>"%P%\user.js" echo user_pref("browser.aboutwelcome.enabled", false);
>>"%P%\user.js" echo user_pref("datareporting.policy.dataSubmissionPolicyBypassNotification", true);
>>"%P%\user.js" echo user_pref("browser.sessionstore.resume_from_crash", false);
start "" "%F%" -no-remote -profile "%P%" --kiosk "file:///%U%"
