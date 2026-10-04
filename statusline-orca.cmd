@echo off
rem Reparte el JSON de stdin entre el statusline propio (pinta) y el de Orca (envia rate_limits, no pinta).
setlocal
set "F=%TEMP%\cc-statusline-%RANDOM%%RANDOM%.json"
findstr "^" > "%F%"
call "%~dp0statusline.cmd" < "%F%"
set "ORCA=%USERPROFILE%\.orca\agent-hooks\claude-statusline.cmd"
if exist "%ORCA%" call "%ORCA%" < "%F%" >nul 2>&1
del "%F%" >nul 2>&1
exit /b 0
