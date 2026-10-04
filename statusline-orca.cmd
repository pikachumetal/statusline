@echo off
rem Reparte el JSON de stdin entre el statusline propio (pinta) y el de Orca (envia rate_limits, no pinta).
rem ponytail: si Claude Code mata el proceso antes del del, el temporal queda huerfano en %TEMP%
rem (unos KB por refresco cortado). Si se nota, mover el reparto a statusline.js y quitar el fichero.
setlocal
set "F=%TEMP%\cc-statusline-%RANDOM%%RANDOM%.json"
findstr "^" > "%F%"
call "%~dp0statusline.cmd" < "%F%"
set "ORCA=%USERPROFILE%\.orca\agent-hooks\claude-statusline.cmd"
if exist "%ORCA%" call "%ORCA%" < "%F%" >nul 2>&1
del "%F%" >nul 2>&1
exit /b 0
