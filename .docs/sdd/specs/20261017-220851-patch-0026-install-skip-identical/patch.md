---
id: 20261017-220851-patch-0026-install-skip-identical
task: 0026
title: Patch — el instalador no copia los ficheros idénticos
type: patch
solution: causa raíz
status: done
created: 2026-10-18
branch: patch/0026-install-skip-identical
commit: 079cb89
---

# Patch 0026 — el instalador no copia los ficheros idénticos

## Capacidades

- Modificadas: `installation` — cambia «Copia de ficheros al perfil»: un fichero idéntico al del perfil no se copia, y uno en uso que no ha cambiado ya no corta el update.

## 1. Síntoma

B5 del backlog, literal: «Instalador que se salta los ficheros idénticos: hoy un update con una sesión abierta falla al copiar `statusline.cmd` en uso aunque no haya cambiado (la 0020 lo hace fallar con error en vez de darlo por copiado).»

Medido el 2026-10-18 sobre `develop` (`854b828`), con un perfil temporal ya instalado y otro proceso con `hooks\statusline.cmd` abierto en solo lectura compartida, igual que `cmd.exe` mientras pinta. `install.ps1` sale con:

```
Copy-Item: D:\code\github\pikachumetal\statusline\install.ps1:14
```

El fichero del perfil era idéntico al del repo (`cmp` sin diferencias).

## 2. Causa raíz

`install.ps1:14` copia los cuatro ficheros siempre, con `Copy-Item -Force -ErrorAction Stop`, aunque el destino ya sea idéntico. Sobrescribir pide acceso de escritura. El handle que `cmd.exe` tiene abierto mientras ejecuta `statusline.cmd` solo comparte lectura, así que la copia falla, y el `-ErrorAction Stop` de la 0020 corta el update. Había un fallo sin nada que cambiar.

## 3. Fix

- **Fichero:** `install.ps1`.
- **Cambio:** antes de cada `Copy-Item`, si el destino existe y su `Get-FileHash` coincide con el del repo, el fichero no se copia. Un fichero distinto se sigue copiando, y si está bloqueado sigue fallando con el error de la 0020.
- **Decisiones:**
  - No copiar los ficheros idénticos. — ticket (B5: «Instalador que se salta los ficheros idénticos»)
  - Comparar con `Get-FileHash` (SHA-256): lee el fichero aunque esté abierto en solo lectura compartida. — sin el dev-lead; no cambia lo que el usuario ve.
  - El test para el proceso que tiene el fichero abierto por su PID (`taskkill /pid … /t /f`), no con `kill()`: `kill()` es asíncrono y el handle seguía abierto al borrar el perfil temporal. — sin el dev-lead; solo afecta al test.

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | Reproducir: update con `statusline.cmd` idéntico y en uso | ❌ antes del fix: `Copy-Item: …install.ps1:14`. El test nuevo salía en RED |
| 2 | El mismo update tras el fix (suite) | ✅ código 0, stderr vacío, «Ficheros copiados» |
| 3 | `statusline.cmd` distinto y en uso (suite) | ✅ sigue fallando: código distinto de 0 y el error nombra `statusline.cmd` |
| 4 | `node statusline.test.js` | ✅ OK |
| 5 | `claude plugin test mod` | ✅ 37 pass, 0 fail |
| 6 | `install.ps1` sobre `~/.claude` y `~/.claude-gco` con la sesión abierta, 3 veces cada uno (ejecución real) | ✅ 6 de 6 con código 0 y «Ficheros copiados» |

Validación diferida: 2026-10-18 · «Diferir: lo pruebo en el próximo update de la status line, a cargo del dev-lead» · disparador: próximo update de la status line, a cargo del dev-lead

## 5. Tiempo (ligero)

- Estimación: 0.5h
- Real: 0.4h

## 6. Delta de capacidad

### Capacidad: `installation`

**MODIFIED — Copia de ficheros al perfil**
- GIVEN el repo clonado en una máquina Windows con PowerShell 7+
- WHEN se ejecuta `.\install.ps1`, con o sin `-ConfigDir <perfil>`
- THEN `statusline.js`, `statusline.cmd`, `statusline-orca.cmd` y `statusline.test.js` se copian a `<perfil>\hooks`
- AND el perfil por defecto es `~/.claude`
- AND la carpeta `hooks` se crea si no existe, y los ficheros que ya hubiera se sobrescriben
- AND un fichero idéntico byte a byte al del repo no se copia: un update con una sesión abierta, que tiene `statusline.cmd` en uso, termina bien si ese fichero no ha cambiado
- AND si un fichero no se puede copiar (p. ej. `statusline.cmd` distinto del del repo y bloqueado por la sesión que lo usa), el instalador se para en él con un error que lo nombra y código de salida distinto de 0, sin decir que ha copiado los ficheros ni mostrar el bloque `statusLine`; los copiados antes se quedan
