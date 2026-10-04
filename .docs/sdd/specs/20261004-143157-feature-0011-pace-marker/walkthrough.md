---
id: 20261004-143157-feature-0011-pace-marker
feature: 0011
title: Walkthrough — Marcador de ritmo en las barras de cuota
spec: ./spec.md
plan: ./plan.md
status: done
created: 2026-10-04
---

# Walkthrough — Marcador de ritmo en las barras de cuota

## 1. Cambios realizados

- `statusline.js` — `bar(pct, width, pace = null)` pinta `┃` blanco en la celda del ritmo, con fondo del gradiente si la celda está llena y gris si no. `renderFiveHour` y `renderSevenDay` le pasan el transcurrido sobre la ventana. Se exportan `gradientAt`, `GRAY_BG` y `RESET` para los tests. (`60c8026`)
- `statusline.test.js` — asserts del marcador en las dos ventanas y en `bar`, y la deuda de la 0010: los 7 restos y el color del sub-bloque con su `RESET`. (`60c8026`)
- Spec y plan. (`617d3ce`)

## 2. Tiempo y coste: estimado vs real

- Tipo: frontend
- Estimación de implementación (del plan): 0,3h
- Esfuerzo real: 0,3h — reloj del hilo aproximado con las marcas de los commits (rama 16:31, task 16:35) más la revisión y el cierre hasta las 16:49
- Desviación: 0h (0 %)
- Causa de la desviación: no aplica
- Modelo del hilo: Opus 5.5, effort no registrado
- Tokens del hilo: 4.402.315 — claude-opus-5-5 4.402.315 (incluye toda la sesión anterior a la rama)
- Tokens de subagentes: 221.686 en 1 despacho — Revisión final feature 0011 claude-sonnet-5-5 221.686 / 1 min
- Coste de la sesión: sin precio (sin tabla pricing en sdd-kit.json)
- Coste de sujetos: no aplica
- Review de spec: no · hallazgos 0, aceptados 0

## 3. Desviaciones del plan

- Revisión final con `sdd-kit:effort-medium` + `sonnet`, confirmada por el dev-lead al despachar («Sí, Sonnet medium (Recommended)»).
- Native sin `task-start`/`task-done` ni ledger: una task, con la copia de los RED fuera del repo y comparada con `git diff --no-index` (sin cambios).

### Decisiones tomadas sin el dev-lead

- Modo full en vez de lite — lite necesita la confirmación del dev-lead y el perfil es `unattended` — coste si está mal: spec y plan de más.
- El marcador sustituye al sub-bloque si caen en la misma celda — con 8 celdas, la precisión del marcador ya es menor que la del octavo — coste si está mal: un octavo menos en esa celda.
- Los cuatro Minor de la revisión final se difieren (ver 4.3) — un commit más abría otra re-revisión por asserts y una cota sin efecto visible — coste si está mal: el reset vencido y el `resets_at` no numérico solo se prueban a nivel de `bar`.

## 4. Verificación

### 4.1 Builds

- Sin build: Node sin compilar.
- Suite completa: `node statusline.test.js` → `statusline.test.js OK` · <1 s

### 4.2 Smoke / tests

- Validación diferida: 2026-10-04 · «LANZA EL SIGUIENTE UNATTENDED» · disparador: smoke de la release 2.0.0, a cargo del dev-lead

Revisión final: sdd-kit:effort-medium + sonnet, con hallazgos (4 Minor, diferidos), sobre 60c8026.

| THEN | Evidencia | Resultado |
| --- | --- | --- |
| 5h: marcador en la celda del transcurrido (1h23m, 34 % → `██┃█████`) | ejecución real (`node statusline.js` con `resets_at` a +3h37m) + suite | ✅ |
| 5h: sin `resets_at`, barra sin marcador | suite (`sin marcador sin reset`, vía `bar` sin ritmo) | ✅ |
| 7d: marcador con 6 días (38 % → `██████┃█`) | ejecución real (`resets_at` a +24 h) + suite | ✅ |
| 7d: reset vencido → última celda | suite (`bar(38, 8, 100)`) | ✅ |
| 7d: sin `resets_at`, barra sin marcador | suite (`render(weekBare)`) | ✅ |
| Barras: celda del marcador sobre gradiente o gris; 80 % con ritmo 27,7 % → `██┃███▍█` | suite | ✅ |
| Barras: resto de cláusulas (octavos, color, fondo, acotado) | suite (tests de la 0010 y los 7 restos) | ✅ |

### 4.3 Residuales / deuda generada

- Minor de la revisión final: sin assert de render del reset vencido semanal, de `resets_at` no numérico en las dos ventanas ni del contexto sin `┃`; `elapsed` semanal sin cota inferior en la variable (sin efecto visible); `ESC_BG_GRAY` repite `GRAY_BG` en el test. → deuda técnica del roadmap.
- Visto en la ejecución real: con algo menos de 24 h hasta el reset, el `↻` semanal pinta `24h00m` en vez de `1d00h` (redondeo de `fmtDuration` a la hora). Anterior a esta feature. → deuda técnica del roadmap.

## 5. Aprendizajes

- Un marcador dentro de una barra de bloques tiene que llevar el color de la celda en el fondo: si sustituye el carácter, el relleno de esa celda se pierde. → `architecture.md` («Decisiones técnicas»).
- Revisión de skills: no aplica — el repo no tiene `.claude/skills/` (mirado).

## 6. Adendas

- 2026-10-05 — Validado en el smoke de la release 1.1.0: «Validado: lo he probado y funciona» · no detalló qué probó — el dev-lead
