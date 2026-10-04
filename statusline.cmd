@echo off
rem Lanza statusline.js (junto a este .cmd) con el node.exe real de proto, no con el shim:
rem el shim inyecta a veces una linea NDJSON en stdout que ensuciaria el statusline.
setlocal
set "BASE=%USERPROFILE%\.proto\tools\node"
set "BEST="
set /a BM=-1, BN=-1, BP=-1
rem Por SemVer y no por nombre: como texto, 26.9.0 va detras de 26.10.0 y 9.x delante de 26.x.
for /f "delims=" %%D in ('dir /b /ad "%BASE%" 2^>nul') do (
  if exist "%BASE%\%%D\node.exe" (
    for /f "tokens=1-3 delims=.-" %%a in ("%%D") do call :consider "%%D" %%a %%b %%c
  )
)
if defined BEST (
  "%BASE%\%BEST%\node.exe" "%~dp0statusline.js"
  exit /b 0
)
rem Sin proto: node del PATH.
node "%~dp0statusline.js"
exit /b 0

rem Un nombre que no es una version cuenta como 0.0.0.
:consider
set "M=%~2" & set "N=%~3" & set "P=%~4"
set /a M=M+0, N=N+0, P=P+0 2>nul
if %M% GTR %BM% goto :take
if %M% LSS %BM% exit /b
if %N% GTR %BN% goto :take
if %N% LSS %BN% exit /b
if %P% GTR %BP% goto :take
exit /b
:take
set "BEST=%~1"
set /a BM=M, BN=N, BP=P
exit /b
