---
id: 20261004-151215-feature-0013-cost-per-hour
feature: 0013
title: Walkthrough — Coste por hora
spec: ./spec.md
plan: ./plan.md
status: done
created: 2026-10-04
---

# Walkthrough — Coste por hora

## 1. Cambios realizados

- `statusline.js` — `renderCost(cost)` sale de `renderLine2`: valida `total_cost_usd` con `Number.isFinite` y añade ` · $X.XX/h` desde 5 minutos con coste > 0. `renderSevenDay` acota el transcurrido a 0 por abajo. (`b4bf411`)
- `statusline.test.js` — asserts del coste por hora y del coste no numérico, y la deuda de la 0011: marcador a través del render (vencido, reset lejano, `resets_at` inválido, contexto sin `┃`) y `GRAY_BG` en vez de la constante duplicada. (`b4bf411`)
- Spec y plan. (`08005b3`)

## 2. Tiempo y coste: estimado vs real

- Tipo: frontend
- Estimación de implementación (del plan): 0,3h
- Esfuerzo real: 0,25h — reloj del hilo aproximado con las marcas de los commits (rama 17:12, task 17:14) más la revisión y el cierre hasta las 17:20
- Desviación: -0,05h (-17 %)
- Causa de la desviación: no aplica
- Modelo del hilo: Opus 5.5, effort no registrado
- Tokens del hilo: 4.132.210 — claude-opus-5-5 4.132.210 (incluye toda la sesión anterior a la rama)
- Tokens de subagentes: 155.904 en 1 despacho — Revisión final feature 0013 claude-sonnet-5-5 155.904 / 1 min
- Coste de la sesión: sin precio (sin tabla pricing en sdd-kit.json)
- Coste de sujetos: no aplica
- Review de spec: no · hallazgos 0, aceptados 0

## 3. Desviaciones del plan

- Revisión final con `sdd-kit:effort-medium` + `sonnet`, confirmada por el dev-lead al despachar («Sí, Sonnet medium (Recommended)»).
- Native sin `task-start`/`task-done` ni ledger: una task, con la copia de los RED fuera del repo y comparada con `git diff --no-index` (sin cambios).

### Decisiones tomadas sin el dev-lead

- Modo full en vez de lite — lite necesita la confirmación del dev-lead y el perfil es `unattended` — coste si está mal: spec y plan de más.
- El coste por hora se pinta desde 5 minutos — por debajo se dispara con la primera respuesta — coste si está mal: un umbral que cambiar en una constante.
- El Important de la revisión final (`total_duration_ms` no numérico pinta `⏱️ NaNm`) se difiere a un patch — reproducido; ya estaba en `develop` y queda fuera de los THEN de esta spec: arreglarlo aquí cambiaba la salida observable sin spec (freno de alcance), y en `unattended` va la opción conservadora — coste si está mal: el reloj sigue pintando `NaNm` con una duración no numérica hasta el patch.
- Los dos Minor (coste negativo pinta `$-1.00`; duración 1e308 pinta `$0.00/h`) se difieren — sin caso real — coste si está mal: ninguno visible hoy.

## 4. Verificación

### 4.1 Builds

- Sin build: Node sin compilar.
- Suite completa: `node statusline.test.js` → `statusline.test.js OK` · <1 s

### 4.2 Smoke / tests

- Validación diferida: 2026-10-04 · «PUES LA SIGUIENTE IGUAL» · disparador: smoke de la release 2.0.0, a cargo del dev-lead

Revisión final: sdd-kit:effort-medium + sonnet, con hallazgos (1 Important y 2 Minor, diferidos), sobre b4bf411.

| THEN | Evidencia | Resultado |
| --- | --- | --- |
| Coste con dos decimales | ejecución real (`💰 $0.47`) + suite | ✅ |
| Sin campo o no numérico → `$0.00` | ejecución real (`"abc"` → `💰 $0.00`; antes del cambio, Node fallaba) + suite | ✅ |
| Desde 5 min y coste > 0 → `💰 $0.47 · $2.35/h` | ejecución real ($0.47 en 12 min) + suite (5 min exactos → `$3.00/h`) | ✅ |
| Menos de 5 min, sin duración numérica o coste 0 → sin `/h` | suite | ✅ |
| Semanal: transcurrido acotado entre 0 y 7 días; reset lejano → `⏳ 0m ┃███████` | suite | ✅ |
| Semanal: resto de cláusulas (marcador, vencido, sin `resets_at`) | suite (`weekAt` y tests de la 0011) | ✅ |

### 4.3 Residuales / deuda generada

- `total_duration_ms` no numérico pinta `⏱️ NaNm` (e `Infinity`, `InfinityhNaNm`) — Important de la revisión final, anterior a esta feature. → deuda técnica del roadmap, como patch.
- Coste negativo pinta `$-1.00`; duración 1e308 pinta `$0.00/h` — Minor, sin caso real. → incluidos en la misma fila de deuda.

## 5. Aprendizajes

- La regla de `Number.isFinite` (`architecture.md`) se aplica por segmento: el reloj y el coste leen el mismo objeto `cost` y solo uno la cumplía. No añade nada a `architecture.md`: la regla ya está; la deuda la recoge.
- Revisión de skills: no aplica — el repo no tiene `.claude/skills/` (mirado).

## 6. Adendas

- 2026-10-05 — Validado en el smoke de la release 1.1.0: «Validado: lo he probado y funciona» · no detalló qué probó — el dev-lead
