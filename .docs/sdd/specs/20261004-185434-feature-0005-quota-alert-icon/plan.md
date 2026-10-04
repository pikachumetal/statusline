---
id: 20261004-185434-feature-0005-quota-alert-icon
feature: 0005
title: Plan de implementación — Icono de alerta en las ventanas de cuota
spec: ./spec.md
status: approved
created: 2026-10-04
---

# Plan de implementación — Icono de alerta en las ventanas de cuota

## Decisiones que he tomado yo — valida estas

1. Una task, en Native con la sesión. Revisión final con `sdd-kit:effort-medium` + `sonnet`, como en las anteriores; se confirma al despachar.
2. `contextEmoji` se renombra a `levelEmoji`: ya no es solo del contexto.
3. Coste: ~0,2 h; una revisión final.
4. Review Focus: 2 entradas; ver la sección.

**Goal**: las ventanas de 5h y semanal pintan el icono de nivel delante de su etiqueta.

**Architecture**: `levelEmoji(pct)` (antes `contextEmoji`) lo usan el contexto y las dos ventanas.

**Tech Stack**: Node sin dependencias; tests con `assert` en `statusline.test.js`.

**Spec**: `./spec.md`

**Ejecución**: auto en sdd-kit.json → native, porque es una sola task pequeña. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: despacha las que quedan con subagent-driven-development sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para la revisión final.

## Restricciones globales

### De código

- Sin dependencias npm: solo Node y `git`.
- `render` y sus `render*` son puras.
- Iconos y cortes del nivel: 🟢 < 20, 🟡 < 70, 🔥 < 90, 🚨 ≥ 90, sobre el porcentaje ya acotado.
- Comentarios en español que explican el porqué; sin comentarios que repitan el código ni que citen documentos.

### De proceso

- Tests en RED los escribe el hilo principal (constitution, principio 1).
- Commits: tipo y scope en inglés; título y cuerpo en castellano.

## Review Focus

- Porcentaje no numérico en una ventana → 🟢 (se acota a 0) · Task 1, `icono con porcentaje no numérico`
- Corte exacto en 90 % → 🚨 · Task 1, `icono en el corte del 90`

---

## Phase -1 — Pre-Implementation Gates

- [x] **Simplicity gate**: reusar la función del contexto.
- [x] **YAGNI gate**: sin abstracciones.
- [x] **Brownfield gate**: el contexto pinta igual.
- [x] **Constitution check**: regla 4.

---

## 1. Decisiones técnicas

### 1.1 Estructura de ficheros

**Modificar**:

- `statusline.js` — `levelEmoji`, `renderFiveHour`, `renderSevenDay`.
- `statusline.test.js` — tests del icono.
- `.docs/sdd/constitution.md` — regla 4, al cerrar.

### 1.8 Rollout

Directo.

### 1.9 Excepciones a la constitution

Ninguna.

---

## 2. Tasks

### Task 1 — Icono de nivel en las ventanas

**Modelo**: Native (la sesión).
**Tests RED**: hilo principal · `statusline.test.js`, antes del código.
**Superficies**: backend (Node).
**Verificación**: `node statusline.test.js` (imprime `statusline.test.js OK`).
**Se prueba en la aplicación**: con el fixture (5h 34 %, semanal 38 %), la L2 pinta `🟡 5h ⏳ 1h23m` y `🟡 7d ⏳ 6d00h`.

**Interfaces**:
- Consume: `clamp(n)`.
- Produce: `levelEmoji(pct)` → `'🟢' | '🟡' | '🔥' | '🚨'`.

**Ficheros**: modificar `statusline.js`, `statusline.test.js`.

- [ ] **Step 1: Tests RED**:

```js
const windows = (five, week) => cells(render({ rate_limits: { five_hour: { used_percentage: five }, seven_day: { used_percentage: week } } }, env, NOW).split('\n')[1]);
assert.ok(cells(l2).includes('🟡 5h ⏳ 1h23m') && cells(l2).includes('🟡 7d ⏳ 6d00h'), 'icono en las ventanas del fixture');
assert.ok(windows(95, 10).includes('🚨 5h') && windows(95, 10).includes('🟢 7d'), 'icono 🚨 y 🟢');
assert.ok(windows(90, 75).includes('🚨 5h') && windows(90, 75).includes('🔥 7d'), 'icono en el corte del 90');
assert.ok(windows('x', 'x').includes('🟢 5h') && windows('x', 'x').includes('🟢 7d'), 'icono con porcentaje no numérico');
```

- [ ] **Step 2: Implementación** — renombrar `contextEmoji` a `levelEmoji`; `renderFiveHour` y `renderSevenDay` empiezan por `${levelEmoji(pct)} ` delante de la etiqueta.
- [ ] **Step 3: Verificación** — `node statusline.test.js` → `statusline.test.js OK`.
- [ ] **Step 4: Commit de la task** — `feat(statusline): icono de nivel en las ventanas de 5h y semanal`.

---

## Estimación y esfuerzo

- Tipo: frontend
- Esfuerzo spec + plan: 0,1h
- Estimación de implementación: 0,2h
- Base de la estimación: la 0013 (0,25h), con menos lógica
- Confianza: alta

---

## 3. Validación final

- [ ] Gate de cierre: `node statusline.test.js`.
- [ ] Ejecución real: pintar el JSON de ejemplo y mirar la L2.
- [ ] Cierre con `sdd-end-feature`.

---

## 4. Self-review (cobertura spec → tasks)

- Icono de nivel en 5h y semanal, con sus cortes → `icono en las ventanas del fixture`, `🚨 y 🟢`, `corte del 90`. ✓
- Sin `resets_at`: icono, etiqueta, barra, porcentaje → `windows(...)` va sin `resets_at`. ✓
- Resto de cláusulas → tests de 0008, 0011 y 0013. ✓
