---
id: 20261019-083021-patch-0029-controls-right-brackets
task: 0029
title: Patch — modos y Board del mod a la derecha y entre corchetes
type: patch
solution: dev-lead
status: done
created: 2026-10-19
branch: patch/0029-controls-right-brackets
commit: fc2bd23
---

# Patch 0029 — modos y Board del mod a la derecha y entre corchetes

## Capacidades

- Modificadas: `controls` — cambian «Fila plegada» y «Estado de los tests»: los tests, los modos y Board van a la derecha, entre corchetes y separados por barras.

## 1. Síntoma

Petición del dev-lead sobre una captura de la fila del mod, con una flecha desde `🗿 caveman  🦥 full  Board` hasta el `[-]` de la banda: «poner algo de separacion entre caveman y ponytail, tambien -> [caveman] | [full] [Board] para que se vea que se puede clickar».

## 2. Solución fijada

Fijada por el dev-lead, con dos preguntas cerradas sobre la captura:
- la flecha: «Alinear a la derecha»: el modelo y el effort se quedan a la izquierda; caveman, ponytail y Board se pegan a la derecha, antes del `[-]` del motor;
- los corchetes: «Solo los de tu ejemplo»: `[🗿 caveman] | [🦥 full] [Board]`; el modelo y el effort, como están;
- el sitio de los tests, tras verlo en su sesión: «te diria que -> [passed] | [🗿 caveman] | [🦥 full] [Board]».

**Lo que da por existente, comprobado:** la fila plegada de `mod/hooks/register.tsx` y `justifyContent`/`width` en el `Box` de la API 2.1.303.

## 3. Fix

- **Ficheros:** `mod/hooks/register.tsx`, `mod/tests/row.test.tsx`, `README.md` y `README.en.md`.
- **Cambio:**
  - la fila plegada son dos grupos con `justifyContent="space-between"` a todo el ancho: modelo y effort a la izquierda; tests, `|`, caveman, `|`, ponytail y Board a la derecha;
  - `[🗿 …]`, `[🦥 …]` y `[Board]` entre corchetes; las barras, en gris; la que sigue a los tests solo sale con tests.
- **Decisiones:**
  - Modos y Board alineados a la derecha. — dev-lead
  - Corchetes solo en caveman, ponytail y Board, con `|` entre caveman y ponytail. — dev-lead
  - `[passed]`/`[failed]` abre el grupo derecho, separado de caveman por `|`. — dev-lead
  - Sin resultado de tests no se pinta la barra que lo separa. — sin el dev-lead; sin tests, una barra suelta al principio no separa nada.
  - El selector abierto no cambia. — sin el dev-lead; la petición solo habla de la fila plegada.

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | RED: corchetes en caveman, ponytail y Board, y el separador `modes-sep` | ✅ fallaba «collapsed row shows the five controls in order» |
| 1b | RED: `[passed]` antes de caveman, con `tests-sep`; sin tests, sin `tests-sep` | ✅ fallaba «a passing test run shows passed» |
| 2 | `claude plugin test mod` tras el cambio | ✅ 39 pass, 0 fail; tests RED sin tocar (`git diff --no-index`) |
| 3 | `claude plugin validate mod` | ✅ con el aviso que ya estaba |
| 4 | `node statusline.test.js` | ✅ OK |
| 5 | En una sesión real tras `/reload-plugins`: modos y Board a la derecha, junto al `[-]` | ✅ reportado por el dev-lead: lo vio y pidió mover los tests (1b) |
| 6 | En una sesión real: `[passed] \| [🗿 caveman] \| [🦥 full] [Board]` | ✅ reportado por el dev-lead |

Validado: 2026-10-19 · «Validado: lo he probado y funciona» · no detalló qué probó

## 5. Tiempo (ligero)

- Estimación: 0.25h
- Real: 0.5h

## 6. Delta de capacidad

### Capacidad: `controls`

**MODIFIED — Fila plegada**
- GIVEN el mod instalado, la sesión en `claude-opus-5-5` con effort `medium` en el último turno, `.caveman-active` = `caveman` y `.ponytail-active` = `full`
- WHEN Claude Code pinta la banda sobre el prompt, sin encuesta
- REMOVED THEN la fila muestra, en este orden, `🤖 Opus 5.5`, `(medium)` en gris, `🗿 caveman`, `🦥 full` y `Board`
- THEN la fila muestra a la izquierda `🤖 Opus 5.5` y `(medium)` en gris, y a la derecha, en este orden, `[🗿 caveman]`, `|` en gris, `[🦥 full]` y `[Board]`
- AND la fila no pinta el coste: está en la status line (segmento `cost`)
- AND el modelo, el effort, caveman, ponytail y Board se pueden pulsar

**MODIFIED — Estado de los tests**
- GIVEN una sesión en la que todavía no se ha lanzado ningún test
- WHEN se pinta la fila
- THEN no aparece indicador de tests
- REMOVED AND tras un `node statusline.test.js` por Bash o por PowerShell que sale con 0, aparece `[passed]` en verde antes de `Board`
- AND tras un `node statusline.test.js` por Bash o por PowerShell que sale con 0, aparece `[passed]` en verde al principio del grupo derecho, seguido de `|` en gris antes de `[🗿 …]`
- AND tras un `npm test` que sale con 1, cambia a `[failed]` en rojo
- AND un comando compuesto cuenta si alguno de sus tramos separados por `&&`, `||`, `;` o `|` es un test: `git add . && node statusline.test.js` cuenta
- AND un `git status` posterior no lo cambia, ni un test lanzado en segundo plano, cuyo resultado no llega con la llamada
