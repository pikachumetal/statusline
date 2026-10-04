---
id: 20261004-113838-patch-0009-orca-wrapper
task: 0009
title: Patch — wrapper de Orca
type: patch
solution: dev-lead
status: done
created: 2026-10-04
branch: chore/0009-orca-wrapper
commit: ca803d2
---

# Patch 0009 — wrapper de Orca

## Capacidades

- Modificadas: `installation` — la copia incluye `statusline-orca.cmd`, el bloque apunta al wrapper si Orca está instalado, y nuevo requisito «Wrapper de Orca».

## 1. Síntoma

La integración con Orca entró en `develop` sin registro SDD: commit `42780e8` y merge `252c34c`, desde la rama `feature/orca-statusline`, hecha en un equipo sin el kit. Al revisarla salieron tres problemas:

- `statusline-orca.cmd` escribe un temporal en `%TEMP%`, y la regla 1 de `constitution.md` dice que el statusline no escribe ficheros.
- El test del instalador elige la ruta que espera según haya Orca instalado o no en la máquina (`fs.existsSync(~/.orca/agent-hooks/claude-statusline.cmd)`). En cada PC solo se prueba una de las dos ramas.
- No hay `patch.md` ni spec, ni entrada en el changelog o en el roadmap, ni delta en `installation`.

## 2. Solución fijada

El dev-lead, el 2026-10-04, a la propuesta de revisión: «sí, haz pull y abre el patch, porque no tenia el sdd-kit en el portatil y faltara documentacion». La propuesta aceptada decía:

1. Apuntar la excepción en `constitution.md` y tener en cuenta la fuga del temporal.
2. Pasar la ruta de Orca como parámetro a `install.ps1` y probar las dos ramas.
3. Completar el registro SDD.

Comprobado que existe lo que se da por existente: `statusline-orca.cmd`, la detección de Orca en `install.ps1` y el `orca ? … : …` de `statusline.test.js`, todo en `252c34c`.

Qué hace la integración (registro retroactivo): Orca trae su propio hook de statusline (`~\.orca\agent-hooks\claude-statusline.cmd`). Ese hook lee `rate_limits` del JSON de Claude Code para enseñar el % de uso en Orca, y no pinta nada. Claude Code solo admite un `statusLine.command`. Por eso `statusline-orca.cmd` guarda el stdin en un temporal, se lo pasa primero a `statusline.cmd` (que pinta) y después al hook de Orca (con su salida descartada), y borra el temporal. Sale siempre con 0.

## 3. Fix

- **Fichero(s)**: `install.ps1`, `statusline.test.js`, `statusline-orca.cmd`, `.docs/sdd/constitution.md`
- **Cambio**: `install.ps1` acepta `-OrcaHook <ruta>`, que por defecto es `~\.orca\agent-hooks\claude-statusline.cmd`. El test lo usa para probar las dos ramas sin depender de la máquina. La regla 1 recoge la excepción del temporal del wrapper.
- **Decisiones**:
  - La fuga del temporal se documenta y no se corrige. Solo pasa si Claude Code mata el proceso entre la escritura y el `del`, y cada fichero ocupa unos KB. Para corregirla habría que repartir el stdin desde `statusline.js`, que entonces tendría que lanzar el hook de Orca, un binario más allá de Node y `git` (principio 2). Queda un marcador `ponytail:` en el wrapper. — sin el dev-lead (no cambia lo que el usuario ve ni lo que puede hacer)
  - `-OrcaHook` se queda como parámetro del instalador y no se documenta en el README, porque solo lo usan los tests. — sin el dev-lead (interno)

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | RED: test nuevo «con Orca el bloque apunta a statusline-orca.cmd» antes de añadir `-OrcaHook` | ✅ falla con `AssertionError: con Orca el bloque apunta a statusline-orca.cmd` |
| 2 | GREEN: `node statusline.test.js` con las dos ramas (hook de Orca falso que existe y ruta inexistente) | ✅ `statusline.test.js OK` |

Validado: 2026-10-04 · «si» · no detalló qué probó

## 5. Tiempo (ligero)

- Real: 0,5h

## 6. Delta de capacidad

### Capacidad: `installation`

**MODIFIED — Copia de ficheros al perfil**
- GIVEN el repo clonado en una máquina Windows con PowerShell 7+
- WHEN se ejecuta `.\install.ps1`, con o sin `-ConfigDir <perfil>`
- THEN `statusline.js`, `statusline.cmd`, `statusline-orca.cmd` y `statusline.test.js` se copian a `<perfil>\hooks`
- AND el perfil por defecto es `~/.claude`
- AND la carpeta `hooks` se crea si no existe, y los ficheros que ya hubiera se sobrescriben

**MODIFIED — El instalador no toca settings.json**
- GIVEN una instalación en un perfil
- WHEN `install.ps1` termina
- THEN muestra por pantalla el bloque `statusLine` que hay que pegar en `<perfil>\settings.json`, con la ruta del `.cmd` ya escapada, `padding: 0` y `refreshInterval: 10`
- AND el `.cmd` es `statusline-orca.cmd` si existe el hook de Orca (`-OrcaHook`, por defecto `~\.orca\agent-hooks\claude-statusline.cmd`), y `statusline.cmd` si no
- AND no crea ni modifica `settings.json`

**ADDED — Wrapper de Orca**

> Cobertura: sin test.

- GIVEN `statusline-orca.cmd` y `statusline.cmd` en la misma carpeta
- WHEN Claude Code ejecuta `statusline-orca.cmd` con el JSON de la sesión por stdin
- THEN guarda el stdin en un temporal de `%TEMP%` y se lo pasa a `statusline.cmd`, que pinta
- AND si existe `%USERPROFILE%\.orca\agent-hooks\claude-statusline.cmd`, le pasa el mismo JSON y descarta su salida
- AND borra el temporal y sale con 0
