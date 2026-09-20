---
id: 20260920-161940-patch-0000-installer-update
task: 0000
title: Patch — install.ps1 falla al escapar la ruta y no distingue un update
type: patch
status: done
created: 2026-09-20
branch: chore/installer-update
commit: 345c8fd
---

# Patch 0000 — install.ps1 falla al escapar la ruta y no distingue un update

## 1. Síntoma

Visto por el agente al reinstalar en `~/.claude` y `~/.claude-gco` tras el patch `worktree-name`:

```
install.ps1:12  $json = ($cmd -replace '\', '\\')
The regular expression pattern \ is not valid.
```

Los ficheros se copian, pero el bloque que el instalador muestra para pegar en
`settings.json` sale con la ruta vacía: `"command": "\"\""`.

Requisito añadido por el usuario al abrir el patch: «se tiene que poder poner
sobre instalaciones ya hechas, un update».

## 2. Causa raíz

`-replace` interpreta su primer argumento como expresión regular, y una `\`
suelta no es un patrón válido. La línea lanza una excepción no terminante,
`$json` se queda vacía y el script sigue.

Evidencia:

- Aislado en una línea: `'C:\a\b' -replace '\', '\\'` da el mismo error. Con el patrón escapado (`'\\'`) o con `.Replace('\', '\\')` devuelve `C:\\a\\b`.
- `git log -- install.ps1` muestra un solo commit (`8a7dff9`): el bug está desde la primera versión. No se detectó porque la copia de ficheros ocurre antes de esa línea y `install.ps1` no tenía ningún test (deuda ya anotada en `roadmap.md`).

Sobre el update: la copia ya sobrescribía (`Copy-Item -Force`), así que reinstalar
encima funcionaba. Lo que fallaba para un update era el mensaje: pedía pegar un
bloque en un `settings.json` que ya estaba configurado.

## 3. Fix

- **Fichero(s)**: `install.ps1`, `statusline.test.js`, `README.md`.
- **Cambio**: la ruta se escapa con `.Replace`, que es literal. Antes de mostrar el bloque, el instalador lee `settings.json`; si `statusLine.command` ya apunta al `statusline.cmd` de ese perfil, informa de que está actualizado y no pide pegar nada. `settings.json` solo se lee, nunca se escribe. Si no existe, no se puede leer o apunta a otro comando, muestra el bloque como antes.
- **Interpretación del requisito «update»** (decidida por el agente, a validar): un update es ejecutar el mismo `install.ps1` sobre el mismo perfil. No hay comando ni parámetro nuevo.

## 4. Verificación

Todo verificado por el agente.

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | Test nuevo en RED antes del fix | ✅ `AssertionError: instalación limpia sin errores` |
| 2 | `node statusline.test.js` tras el fix: instalación limpia (sin errores, copia, ruta escapada, no crea `settings.json`) y update (sin errores, sobrescribe, no pide pegar, no toca `settings.json`) | ✅ `statusline.test.js OK` |
| 3 | Update real sobre `~/.claude` | ✅ `Actualizado: …\settings.json ya apunta a …\statusline.cmd` |
| 4 | Update real sobre `~/.claude-gco` | ✅ mismo mensaje |
| 5 | Instalación limpia en una carpeta temporal | ✅ bloque con `"\"C:\\Users\\…\\hooks\\statusline.cmd\""` |

## 5. Tiempo (ligero)

- Real: 0.3h (aproximado)
