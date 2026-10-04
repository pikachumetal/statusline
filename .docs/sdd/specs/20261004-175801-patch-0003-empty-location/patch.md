---
id: 20261004-175801-patch-0003-empty-location
task: 0003
title: Patch — la L1 empieza con un segmento vacío sin directorio de proyecto
type: patch
solution: causa raíz
status: done
created: 2026-10-04
branch: chore/0003-empty-location
commit: 85f1ccb
---

# Patch 0003 — la L1 empieza con un segmento vacío sin directorio de proyecto

## Capacidades

- Modificadas: `session-state` — «Ubicación sin git»: sin directorio de proyecto el segmento no aparece.
- Modificadas: `output` — «Separador de segmentos»: desaparece la excepción del stdin inválido.

## 1. Síntoma

Fila 0003 del roadmap: «Con stdin inválido la L1 empieza con un segmento de ubicación vacío (` │ 🤖 ?`)». Medido igual: `'xx' | node statusline.js` y `'{}' | node statusline.js` pintan la L1 `│ 🤖 ? │ 🗿 caveman │ 🦥 full`, con el separador delante.

## 2. Causa raíz

`renderWhere` (`statusline.js`) devuelve siempre el texto con estilo `BOLD + naranja + nombre + RESET`. Sin git ni directorio de proyecto (`projectDir` devuelve `''`), el nombre es `path.basename('') === ''`: queda un segmento que solo tiene códigos ANSI. `renderLine1` lo añade con `parts.push(renderWhere(...))` sin comprobarlo, y `join(SEP)` pone el separador detrás. El resto de segmentos ya devuelven `null` cuando no tienen nada.

Reproducido en RED: `render({}, env, NOW)` da la L1 `« │ 🤖 ? │ 🗿 lite │ 🦥 full»`.

## 3. Fix

- **Fichero(s)**: `statusline.js`, `statusline.test.js`
- **Cambio**: `renderWhere` devuelve `null` sin nombre, y `renderLine1` solo añade la ubicación si existe, como los demás segmentos.

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | RED: `render({})` → L1 empieza por ` │` | ✅ falla con `L1 sin ubicación empieza por el modelo: « │ 🤖 ? │ 🗿 lite │ 🦥 full»` |
| 2 | GREEN: `node statusline.test.js` | ✅ `statusline.test.js OK` |
| 3 | Ejecución real con stdin `xx` | ✅ L1 `🤖 ? │ 🗿 caveman │ 🦥 full` |
| 4 | Ejecución real en este repo (sin regresión) | ✅ L1 `statusline  chore/0003-empty-location │ 🤖 ? │ …` |

Validación diferida: 2026-10-04 · «ok, sigue» · disparador: smoke de la release 1.1.0, a cargo del dev-lead

## 5. Tiempo (ligero)

- Real: 0,15h

## 6. Delta de capacidad

### Capacidad: `session-state`

**MODIFIED — Ubicación sin git**
- GIVEN un directorio de proyecto que no es un repo git, o un `git` que no responde
- WHEN se pinta la L1
- THEN se muestra solo el nombre del directorio, sin icono de branch ni worktree
- AND sin directorio de proyecto (stdin vacío o inválido) el segmento no aparece, ni su separador

### Capacidad: `output`

**MODIFIED — Separador de segmentos**
- GIVEN una línea con varios segmentos
- WHEN se pinta
- THEN los segmentos van separados por `│` en gris, con un espacio a cada lado
- AND un segmento que no tiene nada que mostrar no deja separador ni hueco
