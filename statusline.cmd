@echo off
rem Lanza statusline.js (junto a este .cmd) con el node.exe real de proto, no con el shim:
rem el shim inyecta a veces una linea NDJSON en stdout que ensuciaria el statusline.
setlocal
set "BASE=%USERPROFILE%\.proto\tools\node"
for /f "delims=" %%D in ('dir /b /ad /o-n "%BASE%" 2^>nul') do (
  if exist "%BASE%\%%D\node.exe" (
    "%BASE%\%%D\node.exe" "%~dp0statusline.js"
    exit /b 0
  )
)
rem Sin proto: node del PATH.
node "%~dp0statusline.js"
exit /b 0
