---
id: 20261004-152728-feature-0001-git-time-budget
feature: 0001
title: Walkthrough — Presupuesto de tiempo de git y del render
spec: ./spec.md
plan: ./plan.md
status: done
created: 2026-10-04
---

# Walkthrough — Presupuesto de tiempo de git y del render

## 1. Cambios realizados

- `statusline.js` — `git(args, cwd, timeout)` recibe el timeout; `readGit(data, run = git)` fija un plazo de 2000 ms (`GIT_BUDGET_MS`) y pasa a cada llamada lo que queda; sin plazo, no llama. Se exporta `readGit`. (`0710885`)
- `statusline.test.js` — `git` lento simulado con `Atomics.wait` (1500 ms en las rutas, sin respuesta a lo demás), `git` rápido y render completo del repo. (`0710885`)
- `constitution.md` (regla 3, ya respondida), `architecture.md` y `tech-stack.md` enlazan la cifra de `capabilities/input.md`.
- Spec y plan. (`1285f49`)

## 2. Tiempo y coste: estimado vs real

- Tipo: backend
- Estimación de implementación (del plan): 0,3h
- Esfuerzo real: 0,3h — reloj del hilo aproximado con las marcas de los commits (rama 17:27, task 17:32) más la revisión y el cierre hasta las 17:36
- Desviación: 0h (0 %)
- Causa de la desviación: no aplica
- Modelo del hilo: Opus 5.5, effort no registrado
- Tokens del hilo: 5.858.135 — claude-opus-5-5 5.858.135 (incluye toda la sesión anterior a la rama)
- Tokens de subagentes: 210.562 en 1 despacho — Revisión final feature 0001 claude-sonnet-5-5 210.562 / 1 min
- Coste de la sesión: sin precio (sin tabla pricing en sdd-kit.json)
- Coste de sujetos: no aplica
- Review de spec: no · hallazgos 0, aceptados 0

## 3. Desviaciones del plan

- Revisión final con `sdd-kit:effort-medium` + `sonnet`, confirmada por el dev-lead al despachar («Sí, Sonnet medium (Recommended)»).
- Native sin `task-start`/`task-done` ni ledger: una task, con la copia de los RED fuera del repo y comparada con `git diff --no-index` (sin cambios).

### Decisiones tomadas sin el dev-lead

- Modo full en vez de lite — lite necesita la confirmación del dev-lead y el perfil es `unattended` — coste si está mal: spec y plan de más.
- Presupuesto compartido en vez de una sola llamada a `git` — probado: `rev-parse` no da rutas, rama y sha en una llamada, y falla entera sin commits — coste si está mal: con un `git` muy lento la rama sale `?`.
- Cifras: 2000 ms para `git` y 3000 ms para el statusline completo — coste si está mal: el render real medido es 1,4 s (Node 0,6 s + `rev-parse` 0,3 s + `symbolic-ref`), con poco margen sobre 3 s en una máquina cargada.
- Los tres Minor de la revisión final se difieren (ver 4.3) — un commit más abría otra re-revisión — coste si está mal: un falso rojo del test de tiempo bloquearía un commit.

## 4. Verificación

### 4.1 Builds

- Sin build: Node sin compilar.
- Suite completa: `node statusline.test.js` → `statusline.test.js OK` · 7,4 s (el test del instalador lanza `pwsh`; el del presupuesto duerme ~2 s)

### 4.2 Smoke / tests

- Validación diferida: 2026-10-04 · «VALE, LANZA EL SIGUIENTE UNATTENDED» · disparador: smoke de la release 1.1.0, a cargo del dev-lead

Revisión final: sdd-kit:effort-medium + sonnet, con hallazgos (3 Minor, diferidos), sobre 0710885.

| THEN | Evidencia | Resultado |
| --- | --- | --- |
| `--no-optional-locks` y stderr descartado | sin cambio en `git()`; revisión | ✅ |
| Presupuesto compartido de 2000 ms; sin presupuesto no se lanza | suite (`git` lento simulado) | ✅ |
| 1500 ms + sin respuesta → ≤ 2000 ms, no 5500 ms | suite (`took <= 2150`, margen del planificador) | ✅ |
| Vacío sin error al agotar el presupuesto | suite (rama `?`) | ✅ |
| Statusline completo < 3000 ms en este repo | ejecución real (1386 ms, L1 `statusline  feature/0001-git-time-budget`) + suite | ✅ |

### 4.3 Residuales / deuda generada

- Tests de tiempo frágiles: margen de 150 ms en el del presupuesto y `spawnSync` del render sin `timeout` ni comprobación de salida; `git()` sin timeout por defecto (Minor de la revisión final). → deuda técnica del roadmap.

## 5. Aprendizajes

- En Windows, el arranque de Node (~0,6 s) pesa más que `git` en el tiempo del statusline: el presupuesto de `git` no basta para acotar el render; por eso el test mide el proceso completo. → `architecture.md` (ya dice dónde está el plazo y por qué el ejecutor es inyectable).
- Revisión de skills: no aplica — el repo no tiene `.claude/skills/` (mirado).

## 6. Adendas

- 2026-10-05 — Validado en el smoke de la release 1.1.0: «Validado: lo he probado y funciona» · no detalló qué probó — el dev-lead
