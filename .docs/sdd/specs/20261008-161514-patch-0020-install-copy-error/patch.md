---
id: 20261008-161514-patch-0020-install-copy-error
task: 0020
title: Patch — install.ps1 da por copiados ficheros que no ha podido copiar
type: patch
solution: causa raíz
status: done
created: 2026-10-08
branch: patch/0020-install-copy-error
commit: <hash>
---

# Patch 0020 — install.ps1 da por copiados ficheros que no ha podido copiar

## Capacidades

- Modificadas: `installation` — «Copia de ficheros al perfil» dice qué pasa cuando una copia falla

## 1. Síntoma

Fila de deuda técnica del roadmap: «`install.ps1` imprime «Ficheros copiados» aunque un `Copy-Item` falle (p. ej. `statusline.cmd` bloqueado por la sesión que lo está usando): el bucle no corta en el primer error». Impacto: un update a medias se da por bueno.

Medido el 2026-10-08 sobre `develop` (`383f127`), con un directorio `hooks\statusline.cmd` en el perfil de destino: `Copy-Item` escribe en stderr «The target file '…\hooks\statusline.cmd' is a directory, not a file.», el bucle sigue y copia `statusline-orca.cmd` y `statusline.test.js`, el script imprime «Ficheros copiados en …» y el bloque `statusLine`, y sale con código 0. Coincide con lo reportado.

## 2. Causa raíz

`install.ps1:12`: `Copy-Item (Join-Path $PSScriptRoot $f) $hooks -Force` sin `-ErrorAction`. En pwsh el error de `Copy-Item` no es terminante y `$ErrorActionPreference` vale `Continue`: el error se escribe y la ejecución sigue en la siguiente iteración del `foreach` y, después, en el `Write-Host "Ficheros copiados en $hooks"` de la línea 17. Nada en el script mira `$?` ni `$Error`, así que el código de salida queda en 0.

La propuesta del dev-lead (`-ErrorAction Stop` en ese `Copy-Item`) actúa sobre esa causa: convierte el error en terminante, y con `-File` un error terminante no capturado corta el script con código 1.

## 3. Fix

- **Fichero(s)**: `install.ps1`, `statusline.test.js`
- **Cambio**: `-ErrorAction Stop` en el `Copy-Item` del bucle. En el bloque del instalador de los tests, una instalación sobre un perfil con un directorio `hooks\statusline.cmd` comprueba el código de salida, que no salen «Ficheros copiados» y que stderr nombra `statusline.cmd`; `install` acepta el perfil como segundo parámetro.
- **Decisiones**:
  - Se para en el primer fallo, sin «Ficheros copiados» ni «Actualizado», con código distinto de 0 y un error que nombra el fichero — dev-lead
  - El fallo se simula con un directorio con el nombre del fichero, no bloqueándolo desde otro proceso — dev-lead
  - Los ficheros copiados antes del que falla se quedan en `hooks` (con `statusline.cmd` bloqueado, `statusline.js` ya es el nuevo): es lo que da `-ErrorAction Stop`; deshacerlos no lo pidió nadie — sin el dev-lead (no cambia lo que se ve: el usuario ve el error y repite la instalación)

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | Test nuevo antes del fix | ✅ en rojo: «copia fallida: código de salida distinto de 0» (`actual: 0`) |
| 2 | Suite completa después del fix | ✅ `statusline.test.js OK`; instalación limpia, con Orca y update siguen en verde |
| 3 | A mano: `install.ps1` sobre un perfil con `hooks\statusline.cmd` directorio | ✅ stdout vacío, `EXIT=1`; en `hooks` solo `statusline.js` y el directorio: no copia `statusline-orca.cmd` ni `statusline.test.js` |

## 5. Tiempo (ligero)

- Real: 0,2h

## 6. Delta de capacidad

### Capacidad: `installation`

**MODIFIED — Copia de ficheros al perfil**

> Cobertura: con test (solo en Windows).

- GIVEN el repo clonado en una máquina Windows con PowerShell 7+
- WHEN se ejecuta `.\install.ps1`, con o sin `-ConfigDir <perfil>`
- THEN `statusline.js`, `statusline.cmd`, `statusline-orca.cmd` y `statusline.test.js` se copian a `<perfil>\hooks`
- AND el perfil por defecto es `~/.claude`
- AND la carpeta `hooks` se crea si no existe, y los ficheros que ya hubiera se sobrescriben
- AND si un fichero no se puede copiar (p. ej. `statusline.cmd` bloqueado por la sesión que lo usa), el instalador se para en él con un error que lo nombra y código de salida distinto de 0, sin decir que ha copiado los ficheros ni mostrar el bloque `statusLine`; los copiados antes se quedan
