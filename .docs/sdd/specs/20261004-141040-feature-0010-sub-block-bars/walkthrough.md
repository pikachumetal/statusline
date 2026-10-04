---
id: 20261004-141040-feature-0010-sub-block-bars
feature: 0010
title: Walkthrough — Barras con sub-bloques
spec: ./spec.md
plan: ./plan.md
status: done
created: 2026-10-04
---

# Walkthrough — Barras con sub-bloques

## 1. Cambios realizados

- `statusline.js` — `bar()` calcula en octavos: celdas enteras con `█`, la celda de corte con `▏▎▍▌▋▊▉` sobre fondo gris (`48;2;60;60;60`) y las vacías como antes. Misma firma; las tres barras lo heredan. (`b5b0c25`)
- `statusline.test.js` — asserts de los tres ejemplos de la spec, el fondo gris, el acotado y el octavo mínimo. (`b5b0c25`)
- Spec y plan. (`593c4fb`)

## 2. Tiempo y coste: estimado vs real

- Tipo: frontend
- Estimación de implementación (del plan): 0,3h
- Esfuerzo real: 0,15h — reloj del hilo aproximado con las marcas de los commits (rama 16:10, task 16:14) más la espera de la revisión final
- Desviación: -0,15h (-50 %)
- Causa de la desviación: el plan ya traía los asserts y el algoritmo; la implementación fue una sola edición que pasó los tests a la primera.
- Modelo del hilo: Opus 5.5, effort no registrado
- Tokens del hilo: 4.076.047 — claude-opus-5-5 4.076.047 (incluye toda la sesión anterior a la rama: patch 0009, migración del kit y roadmap)
- Tokens de subagentes: 99.280 en 1 despacho — Revisión final feature 0010 claude-sonnet-5-5 99.280 / 1 min
- Coste de la sesión: sin precio (sin tabla pricing en sdd-kit.json)
- Coste de sujetos: no aplica
- Review de spec: no · hallazgos 0, aceptados 0

## 3. Desviaciones del plan

- La revisión final fue con `sdd-kit:effort-medium` + `sonnet` y no con `effort-high` + `opus` como dice el plan: el dev-lead eligió Sonnet («Sonnet, effort medium (Recommended)») al confirmar el despacho, como pide su CLAUDE.md.
- Native sin los scripts `task-start`/`task-done` ni ledger: una sola task, con la copia de los RED fuera del repo y comparada con `git diff --no-index` (sin cambios).

### Decisiones tomadas sin el dev-lead

- Modo full en vez de lite — lite necesita la confirmación del dev-lead y el perfil es `unattended` — coste si está mal: spec y plan de más para ~15 líneas.
- Sub-bloque con fondo gris — la barra se lee continua; sin fondo queda un hueco del color de la terminal — coste si está mal: una línea en `bar()`.
- Los dos Minor de la revisión final se difieren (ver 4.3) — un commit más abría otra re-revisión por dos asserts de cobertura — coste si está mal: un error de índice en los restos 2-5 o 7 pasaría los tests.

## 4. Verificación

### 4.1 Builds

- Sin build: Node sin compilar.
- Suite completa: `node statusline.test.js` → `statusline.test.js OK` · <1 s

### 4.2 Smoke / tests

- Validación diferida: 2026-10-04 · «arrancala en unattended» · disparador: smoke de la release 2.0.0, a cargo del dev-lead

Revisión final: sdd-kit:effort-medium + sonnet, con hallazgos (2 Minor, diferidos), sobre b5b0c25.

| THEN | Evidencia | Resultado |
| --- | --- | --- |
| La barra tiene siempre ese número de celdas | suite + ejecución real | ✅ 10 celdas en el contexto, 8 en 5h y 7d |
| Octavos redondeados: celdas enteras `█` y sub-bloque del resto | suite + ejecución real | ✅ |
| 47 % en 10 → `████▊`+5 vacías; 34 % en 8 → `██▊`+5; 38 % en 8 → `███`+5 | ejecución real (`node statusline.js` con el JSON de ejemplo) | ✅ |
| Color por posición en llenas y sub-bloque | ejecución real (el `▊` del 47 % sale con `196;200;9`, el color de la celda 5) | ✅ |
| Sub-bloque sobre fondo gris; vacías `█` grises | suite + ejecución real | ✅ |
| Acotado 0–100 y no numérico | suite (`'x'`, `-5`, `150`, `99.9`) | ✅ |

### 4.3 Residuales / deuda generada

- Minor de la revisión final: sin assert del color por posición del sub-bloque ni del `RESET` tras el fondo gris; solo se prueban los restos 1 y 6. → fila en la deuda técnica del roadmap.

## 5. Aprendizajes

- La celda parcial de una barra truecolor necesita fondo propio para no romper la continuidad. → `architecture.md` («Decisiones técnicas»).
- Revisión de skills: no aplica — el repo no tiene `.claude/skills/` (mirado).

## 6. Adendas

- 2026-10-05 — Validado en el smoke de la release 1.1.0: «Validado: lo he probado y funciona» · no detalló qué probó — el dev-lead
