---
id: 20261004-170112-patch-0015-timing-tests
task: 0015
title: Patch — tests de tiempo sin falsos rojos
type: patch
solution: dev-lead
status: done
created: 2026-10-04
branch: chore/0015-timing-tests
commit: adf17cc
---

# Patch 0015 — tests de tiempo sin falsos rojos

## Capacidades

- Ninguna, porque ninguna capacidad describe los márgenes de los tests ni el valor por defecto interno de `git()`: el presupuesto de «Consulta a git» (`input`) no cambia.

## 1. Síntoma

Minor de la revisión final de la 0001, apuntados como deuda técnica de impacto medio: el test del presupuesto deja 150 ms de margen (`took <= 2150`); el del render completo usa `spawnSync` sin `timeout` ni comprobación de salida, y pasa aunque no haya `.git` ni `git`; `git()` sin `timeout` ejecuta sin límite.

## 2. Solución fijada

El dev-lead, el 2026-10-04, a «¿Lanzo el patch de los tests frágiles en unattended?»: «si,por favor». La fila de deuda decía: «margen de ~2500 ms, `timeout: 5000` y stdout no vacío», y el tercer Minor, «usar un valor por defecto».

Comprobado que existe lo que se da por existente: `took <= 2150` y el `spawnSync` sin `timeout` en `statusline.test.js`, y `git(args, cwd, timeout)` sin valor por defecto en `statusline.js` (`0810379`).

## 3. Fix

- **Fichero(s)**: `statusline.test.js`, `statusline.js`
- **Cambio**: margen del test del presupuesto a 2500 ms; el `spawnSync` del render lleva `timeout: 5000` y comprueba salida 0 y stdout no vacío; `git()` toma `GIT_BUDGET_MS` por defecto (la constante sube encima de `git()`).

## 4. Verificación

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | `node statusline.test.js` con los tres cambios | ✅ `statusline.test.js OK` |
| 2 | Sin RED: el cambio relaja un margen y añade guardas; no hay comportamiento nuevo que poner en rojo | — |

Validación diferida: 2026-10-04 · «si,por favor» · disparador: smoke de la release 1.1.0, a cargo del dev-lead

## 5. Tiempo (ligero)

- Real: 0,1h
