---
id: 20261004-203701-feature-0006-failed-segment-mark
feature: 0006
title: Walkthrough — Marcador ⚠ cuando un segmento falla
spec: ./spec.md
plan: ./plan.md
status: done
created: 2026-10-04
---

# Walkthrough — Marcador ⚠ cuando un segmento falla

## 1. Cambios realizados

- `statusline.js` — `segment(fn)` envuelve cada segmento de `renderLine1` y `renderLine2`: si lanza, devuelve `⚠` en gris (`FAILED`); los `null` se filtran. `main` trata como `{}` un stdin JSON que no es un objeto. (`e6d63f4`)
- `statusline.test.js` — `project_dir: 123` pinta `⚠ │ 🤖 ?` con la L2 entera; sin fallos no hay `⚠`; stdin `null`, `3`, `"x"`, `[]` y `project_dir: 123` pintan con salida 0. (`e6d63f4`)
- `constitution.md` (regla 4 sin pendientes: «falta un dato» se omite, «falla» pinta `⚠`) y `architecture.md` (todo segmento pasa por `segment()`).
- Spec y plan. (`02a8f67`)

## 2. Tiempo y coste: estimado vs real

- Tipo: backend
- Estimación de implementación (del plan): 0,3h
- Esfuerzo real: 0,35h — reloj del hilo aproximado con las marcas de los commits (rama 22:37, task 22:39) más el diseño previo, la revisión y el cierre
- Desviación: +0,05h (+17 %)
- Causa de la desviación: no aplica
- Modelo del hilo: Opus 5.5, effort no registrado
- Tokens del hilo: 7.288.231 — claude-opus-5-5 7.288.231 (incluye toda la sesión anterior a la rama)
- Tokens de subagentes: 285.371 en 1 despacho — Revisión final feature 0006 claude-sonnet-5-5 285.371 / 1 min
- Coste de la sesión: sin precio (sin tabla pricing en sdd-kit.json)
- Coste de sujetos: no aplica
- Review de spec: no · hallazgos 0, aceptados 0

## 3. Desviaciones del plan

- Revisión final con `sdd-kit:effort-medium` + `sonnet`, confirmada por el dev-lead al despachar («Sí, Sonnet medium (Recommended)»).
- Native sin `task-start`/`task-done` ni ledger: una task, con la copia de los RED fuera del repo y comparada con `git diff --no-index` (sin cambios).

### Decisiones tomadas sin el dev-lead

- Modo full en vez de lite — lite necesita la confirmación del dev-lead y el perfil es `unattended` — coste si está mal: spec y plan de más.
- «Falla» es lanzar un error, no que falte un dato — con `⚠` por dato ausente, quien usa la API sin cuota vería `⚠` siempre — coste si está mal: un dato que falta por un error de Claude Code se sigue omitiendo sin aviso.
- Un stdin JSON que no es un objeto se trata como `{}` — antes tiraba el statusline (principio 3) — coste si está mal: ninguno visible.
- Los cuatro Minor de la revisión se difieren (ver 4.3) — un commit más abría otra re-revisión — coste si está mal: dos líneas en blanco de menos y asserts menos estrictos en el bucle del stdin.

## 4. Verificación

### 4.1 Builds

- Sin build: Node sin compilar.
- Suite completa: `node statusline.test.js` → `statusline.test.js OK` · ~7 s

### 4.2 Smoke / tests

- Validación diferida: 2026-10-04 · «ok! dale unattended» · disparador: smoke de la release 1.1.0, a cargo del dev-lead

Revisión final: sdd-kit:effort-medium + sonnet, con hallazgos (4 Minor, diferidos), sobre e6d63f4. Probó ~18 entradas raras por stdin: ninguna tira el statusline.

| THEN | Evidencia | Resultado |
| --- | --- | --- |
| Stdin vacío, no JSON o JSON no objeto → valores por defecto, sin error | ejecución real (`null` → `🤖 ? …` / `⏱️ 0m │ 🟢 … 0% │ 💰 $0.00`; antes rompía) + suite | ✅ |
| Segmento que lanza → `⚠` gris en su sitio, resto igual | ejecución real (`project_dir: 123` → `⚠ │ 🤖 ? │ 🗿 caveman │ 🦥 full`; antes rompía) + suite | ✅ |
| L2 entera con un fallo en la L1 | ejecución real + suite (`💰 $0.00`) | ✅ |
| Sin datos no es fallo: sin `⚠` | suite (`sin fallos no hay marcador`) + tests de ausencia vigentes | ✅ |

### 4.3 Residuales / deuda generada

- Minor de la revisión: faltan las líneas en blanco antes de `renderFiveHour` y `render`; el bucle del stdin solo comprueba `🤖 ?` (no `⏱️ 0m`, `0%`, `$0.00`, ausencia de `⚠` ni stderr vacío). → deuda técnica del roadmap.
- Visto por la revisión, anterior a esta feature: con tipos inesperados se pinta basura que no lanza (`+[object Object]` en velocity, `↻NaN:NaN` en la 5h), además del `⏱️ NaNm` ya apuntado. → se añade a la fila de deuda del `NaNm`.

## 5. Aprendizajes

- Todo segmento nuevo tiene que pasar por `segment()`. → `architecture.md`.
- Revisión de skills: no aplica — el repo no tiene `.claude/skills/` (mirado).

## 6. Adendas

- 2026-10-05 — Validado en el smoke de la release 1.1.0: «Validado: lo he probado y funciona» · no detalló qué probó — el dev-lead
