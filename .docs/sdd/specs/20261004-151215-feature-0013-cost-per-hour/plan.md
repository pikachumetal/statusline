---
id: 20261004-151215-feature-0013-cost-per-hour
feature: 0013
title: Plan de implementación — Coste por hora
spec: ./spec.md
status: approved
created: 2026-10-04
---

# Plan de implementación — Coste por hora

## Decisiones que he tomado yo — valida estas

1. Una task, en Native con la sesión. Revisión final con `sdd-kit:effort-medium` + `sonnet`, como en la 0010 y la 0011; se confirma al despachar (CLAUDE.md del usuario).
2. Ejecución Native: una task en dos funciones del mismo fichero.
3. El segmento de coste sale de `renderLine2` a una función `renderCost(cost)`, como las ventanas: una función `render*` por segmento (`architecture.md`).
4. Coste: ~0,3 h; una revisión final (~100–200k tokens).
5. Review Focus: 4 entradas; ver la sección.

**Goal**: el segmento de coste añade el coste por hora y deja de romper con un coste no numérico.

**Architecture**: `renderCost(cost)` valida los dos campos con `Number.isFinite` y añade ` · $X.XX/h` desde 5 minutos. `renderSevenDay` acota el transcurrido a 0 por abajo.

**Tech Stack**: Node sin dependencias; tests con `assert` en `statusline.test.js`.

**Spec**: `./spec.md`

**Ejecución**: auto en sdd-kit.json → native, porque es una sola task pequeña en funciones puras. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: despacha las que quedan con subagent-driven-development sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para la revisión final.

## Restricciones globales

### De código

- Sin dependencias npm: solo Node y `git`.
- `render` y sus `render*` son puras: sin E/S ni reloj.
- Un campo numérico del JSON se valida con `Number.isFinite` antes de operar con él.
- Comentarios en español que explican el porqué; sin comentarios que repitan el código ni que citen documentos (constitution, spec, task, capacidad).
- Coste por hora: `total_cost_usd / (total_duration_ms / 3 600 000)`, dos decimales, formato ` · $2.35/h`, solo con duración ≥ 5 min (300 000 ms) y coste > 0.

### De proceso

- Tests en RED los escribe el hilo principal (constitution, principio 1).
- Commits: tipo y scope en inglés; título y cuerpo en castellano.

## Review Focus

- `total_cost_usd: 'abc'` → `💰 $0.00`, sin excepción · Task 1, `coste no numérico`
- Duración exacta de 5 min → sí pinta `$/h` · Task 1, `coste por hora desde 5 min`
- Duración no numérica (`'x'`) → sin `$/h` · Task 1, `sin duración numérica`
- `resets_at` semanal a más de 7 días → `⏳ 0m` y marcador en la primera celda · Task 1, `semanal con reset lejano`

---

## Phase -1 — Pre-Implementation Gates

- [x] **Simplicity gate**: una función de segmento y una cota.
- [x] **YAGNI gate**: sin abstracciones.
- [x] **Brownfield gate**: `renderCost` sigue el patrón `render*` del fichero.
- [x] **Constitution check**: principio 3 (nunca rompe) y regla 1 (sin estado) respetados.

---

## 1. Decisiones técnicas

### 1.1 Estructura de ficheros

**Modificar**:

- `statusline.js` — `renderCost(cost)` nuevo, `renderLine2` lo usa, `renderSevenDay` acota.
- `statusline.test.js` — tests del coste por hora y deuda de la 0011.

### 1.8 Rollout

Directo.

### 1.9 Excepciones a la constitution

Ninguna.

---

## 2. Tasks

### Task 1 — Coste por hora

**Modelo**: Native (la sesión).
**Tests RED**: hilo principal · `statusline.test.js`, antes del código.
**Superficies**: backend (Node).
**Verificación**: `node statusline.test.js` (imprime `statusline.test.js OK`, sale con 1 si un assert falla).
**Se prueba en la aplicación**: con el fixture ($0.47 en 12 min) la L2 acaba en `💰 $0.47 · $2.35/h`.

**Interfaces**:
- Consume: `C.dim`, `RESET`, `SEVEN_DAYS_MS` de `statusline.js`.
- Produce: `renderCost(cost)` → texto del segmento.

**Ficheros**: modificar `statusline.js`, `statusline.test.js`.

- [ ] **Step 1: Tests RED** en `statusline.test.js`:

```js
const costL2 = (cost) => cells(render({ ...fixture, cost }, env, NOW).split('\n')[1]);
assert.ok(costL2({ total_cost_usd: 0.47, total_duration_ms: 12 * 60000 }).includes('💰 $0.47 · $2.35/h'), 'coste por hora');
assert.ok(costL2({ total_cost_usd: 0.25, total_duration_ms: 5 * 60000 }).includes('$3.00/h'), 'coste por hora desde 5 min');
assert.ok(!costL2({ total_cost_usd: 0.2, total_duration_ms: 4 * 60000 }).includes('/h'), 'sin coste por hora antes de 5 min');
assert.ok(!costL2({ total_cost_usd: 0, total_duration_ms: 60 * 60000 }).includes('/h'), 'sin coste por hora con coste 0');
assert.ok(!costL2({ total_cost_usd: 0.47, total_duration_ms: 'x' }).includes('/h'), 'sin duración numérica');
assert.ok(costL2({ total_cost_usd: 'abc', total_duration_ms: 12 * 60000 }).includes('💰 $0.00'), 'coste no numérico');
// Deuda 0011: el marcador a través del render.
const weekAt = (resets_at) => cells(render({ rate_limits: { seven_day: { used_percentage: 38, resets_at } } }, env, NOW).split('\n')[1]);
assert.ok(weekAt(NOW / 1000 - 600).includes('███████┃'), 'semanal vencido: marcador en la última celda');
assert.ok(weekAt(NOW / 1000 + 8 * 86400).includes('⏳ 0m ┃███████'), 'semanal con reset lejano');
for (const bad of ['x', {}]) assert.ok(!weekAt(bad).includes('┃'), `semanal sin marcador con resets_at ${JSON.stringify(bad)}`);
assert.ok(!cells(l2).split('│')[1].includes('┃'), 'contexto sin marcador');
```

Además, `ESC_BG_GRAY` del test se sustituye por `GRAY_BG`.

- [ ] **Step 2: Implementación** — `renderCost(cost)` en `statusline.js`, junto a las ventanas: coste `Number.isFinite` o 0; ` · $<coste/horas>.toFixed(2)/h` si `Number.isFinite(duración) && duración >= 300000 && coste > 0`. `renderLine2` hace `parts.push(renderCost(data.cost))`. En `renderSevenDay`, `Math.max(0, …)` sobre el transcurrido.
- [ ] **Step 3: Verificación** — `node statusline.test.js` → `statusline.test.js OK`.
- [ ] **Step 4: Commit de la task** — `feat(statusline): coste por hora junto al coste de la sesión`.

---

## Estimación y esfuerzo

- Tipo: frontend
- Esfuerzo spec + plan: 0,2h
- Estimación de implementación: 0,3h
- Base de la estimación: la 0011 (0,3h real para una task similar)
- Confianza: alta

---

## 3. Validación final

- [ ] Gate de cierre: `node statusline.test.js`.
- [ ] Ejecución real: pintar el JSON de ejemplo y mirar la L2.
- [ ] Spec satisfecha: cada THEN tiene su assert.
- [ ] Cierre con `sdd-end-feature`.

---

## 4. Self-review (cobertura spec → tasks)

- Coste con dos decimales y `$0.00` sin campo o no numérico → `coste no numérico` y tests vigentes. ✓
- Coste por hora desde 5 min, con coste > 0 → `coste por hora`, `desde 5 min`, `antes de 5 min`, `con coste 0`, `sin duración numérica`. ✓
- Semanal acotado a 0 con reset lejano → `semanal con reset lejano`. ✓
- Semanal vencido y `resets_at` no numérico → `semanal vencido`, `sin marcador con resets_at`. ✓
- Deuda 0011 (contexto sin `┃`, `GRAY_BG`) → `contexto sin marcador` y sustitución en el test. ✓
