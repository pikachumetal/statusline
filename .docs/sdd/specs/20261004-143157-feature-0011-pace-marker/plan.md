---
id: 20261004-143157-feature-0011-pace-marker
feature: 0011
title: Plan de implementación — Marcador de ritmo en las barras de cuota
spec: ./spec.md
status: approved
created: 2026-10-04
---

# Plan de implementación — Marcador de ritmo en las barras de cuota

## Decisiones que he tomado yo — valida estas

1. Una task, en Native con la sesión. Revisión final con `sdd-kit:effort-medium` + `sonnet`, como eligió el dev-lead en la 0010 para un diff de este tamaño; se confirma al despachar (CLAUDE.md del usuario).
2. Ejecución Native: una task en tres funciones del mismo fichero; un subagente costaría más que la task.
3. `bar(pct, width, pace = null)`: `pace === null` o `undefined` no pinta marcador; cualquier otro valor se acota con `clamp`.
4. El fondo de la celda del marcador sale de cambiar `38;2` por `48;2` en el color de `gradientAt`, o es `GRAY_BG`.
5. Coste: ~0,5 h; una revisión final (~100k tokens).
6. Review Focus: 5 entradas; ver la sección.

**Goal**: las barras de 5h y semanal pintan dónde estarías gastando uniforme hasta el reset.

**Architecture**: `bar` gana un tercer parámetro opcional, `pace`. `renderFiveHour` y `renderSevenDay` lo calculan con el transcurrido que ya tienen. Todo sigue puro.

**Tech Stack**: Node sin dependencias; tests con `assert` en `statusline.test.js`.

**Spec**: `./spec.md`

**Ejecución**: auto en sdd-kit.json → native, porque es una sola task pequeña en funciones puras. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: despacha las que quedan con subagent-driven-development sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para la revisión final.

## Restricciones globales

### De código

- Sin dependencias npm: solo Node y `git`.
- `render` y `bar` son puras: sin E/S ni reloj (`now` llega por parámetro).
- Comentarios en español que explican el porqué; sin comentarios que repitan el código ni que citen documentos (constitution, spec, task, capacidad).
- Marcador: `┃` en blanco `240;240;240`, en la celda `min(ancho − 1, ⌊ritmo / 100 × ancho⌋)`; fondo del color del gradiente de esa celda si está llena entera, gris (`48;2;60;60;60`) si no.
- Sin `resets_at` válido no hay marcador; la barra del contexto no lo lleva.

### De proceso

- Tests en RED los escribe el hilo principal (constitution, principio 1).
- Commits: tipo y scope en inglés; título y cuerpo en castellano.

## Review Focus

- Ritmo 100 % (reset vencido) → marcador en la última celda, no fuera de la barra · Task 1, `marcador en la última celda`
- Ritmo 0 % → marcador en la primera celda · Task 1, `marcador en la primera celda`
- Porcentaje 0 con ritmo → `┃` sobre gris, resto vacío · Task 1, `marcador sobre gris`
- Marcador en celda llena → fondo del gradiente de esa celda, no gris · Task 1, `marcador sobre gradiente`
- Barra del contexto y ventanas sin `resets_at` → sin `┃` · Task 1, `sin marcador sin reset`

---

## Phase -1 — Pre-Implementation Gates

- [x] **Simplicity gate**: un parámetro opcional y un caso más en el bucle de `bar`.
- [x] **YAGNI gate**: sin abstracciones.
- [x] **Brownfield gate**: la llamada del contexto no cambia; `bar(pct, width)` pinta como hoy.
- [x] **Constitution check**: principios 1–3 y regla 4 (avisos solo visuales) respetados.

---

## 1. Decisiones técnicas

### 1.1 Estructura de ficheros

**Modificar**:

- `statusline.js` — `bar()`, `renderFiveHour()`, `renderSevenDay()`.
- `statusline.test.js` — tests del marcador y deuda de la 0010.

**NO se tocan**:

- `renderLine2` y la barra del contexto — sin ventana, sin ritmo.

### 1.8 Rollout

Directo.

### 1.9 Excepciones a la constitution

Ninguna.

---

## 2. Tasks

### Task 1 — Marcador de ritmo

**Modelo**: Native (la sesión).
**Tests RED**: hilo principal · `statusline.test.js`, antes del código.
**Superficies**: backend (Node).
**Verificación**: `node statusline.test.js` (imprime `statusline.test.js OK`, sale con 1 si un assert falla).
**Se prueba en la aplicación**: con el fixture (5h al 34 % con 1h23m transcurridas, semanal al 38 % con 6 días transcurridos), la 5h pinta `██┃█████` y la semanal `██████┃█`.

**Interfaces**:
- Consume: `gradientAt(t)`, `clamp(n)`, `GRAY_BG`, `EIGHTHS`, `C.gray`, `RESET`, `ESC`, `FIVE_HOURS_MS`, `SEVEN_DAYS_MS` de `statusline.js`.
- Produce: `bar(pct, width, pace = null)`.

**Ficheros**: modificar `statusline.js`, `statusline.test.js`.

- [ ] **Step 1: Tests RED** en `statusline.test.js` (con `cells` y `grayCells` de la 0010, y `strip = cells`):

```js
// Fixture: 5h 34 % con 1h23m transcurridas; semanal 38 % con 6 días.
assert.ok(cells(l2).includes('██┃█████'), '5h con marcador');
assert.ok(cells(l2).includes('██████┃█'), 'semanal con marcador');
assert.strictEqual(cells(bar(80, 8, 27.7)), '██┃███▍█', '80 % con ritmo 27,7 %');
assert.ok(bar(80, 8, 27.7).includes(`${gradientAt(2 / 7).replace('38;2', '48;2')}`), 'marcador sobre gradiente');
assert.ok(bar(0, 8, 0).startsWith(`${ESC_BG_GRAY}`) && cells(bar(0, 8, 0)) === '┃███████', 'marcador sobre gris / primera celda');
assert.strictEqual(cells(bar(38, 8, 100)), '███████┃', 'marcador en la última celda');
assert.ok(!cells(bar(38, 8)).includes('┃'), 'sin ritmo no hay marcador');
assert.ok(!cells(render(weekBare, env, NOW)).includes('┃'), 'sin marcador sin reset');
// Deuda 0010: los 7 restos y el color del sub-bloque.
for (let r = 1; r <= 7; r++) assert.strictEqual(cells(bar(r * 100 / 64, 8))[0], '▏▎▍▌▋▊▉'[r - 1], `resto ${r}`);
assert.ok(bar(34, 8).includes(`${GRAY_BG}${gradientAt(2 / 7)}▊${RESET}`), 'sub-bloque con el color de su celda y RESET');
```

`gradientAt`, `GRAY_BG` y `RESET` se exportan para el test; `ESC_BG_GRAY` es `'\x1b[48;2;60;60;60m'` en el test.

- [ ] **Step 2: Implementación** — `bar(pct, width, pace = null)`: `mark = pace == null ? -1 : Math.min(width - 1, Math.floor(clamp(pace) / 100 * width))`; en el bucle, la celda `i === mark` pinta fondo (gradiente de `i` con `48;2` si `i < full`, `GRAY_BG` si no) + `rgb(240, 240, 240)` + `'┃'` + `RESET`, antes que los demás casos. `renderFiveHour` y `renderSevenDay` pasan `elapsed / ventana * 100` acotado, o `null` sin reset. Exportar `gradientAt`, `GRAY_BG` y `RESET` junto a `render` y `bar`.
- [ ] **Step 3: Verificación** — `node statusline.test.js` → `statusline.test.js OK`.
- [ ] **Step 4: Commit de la task** — `feat(statusline): marcador de ritmo en las barras de 5h y semanal`.

---

## Estimación y esfuerzo

- Tipo: frontend
- Esfuerzo spec + plan: 0,2h
- Estimación de implementación: 0,3h
- Base de la estimación: la 0010 (0,15h real para una task similar), más dos renders
- Confianza: alta

---

## 3. Validación final

- [ ] Gate de cierre: `node statusline.test.js`.
- [ ] Ejecución real: pintar el JSON de ejemplo con `resets_at` y mirar la L2.
- [ ] Spec satisfecha: cada THEN tiene su assert.
- [ ] Cierre con `sdd-end-feature`.

---

## 4. Self-review (cobertura spec → tasks)

- Ventana de 5h con marcador, sin marcador sin reset → Task 1, `5h con marcador`, `sin marcador sin reset`. ✓
- Ventana semanal con marcador; reset vencido en la última celda → Task 1, `semanal con marcador`, `marcador en la última celda`. ✓
- Barras: celda del marcador, fondo gradiente o gris, acotado → Task 1, `80 % con ritmo`, `marcador sobre gradiente`, `marcador sobre gris`. ✓
- Resto de cláusulas de «Barras» (sin cambio) → tests de la 0010. ✓
- Deuda 0010 → Task 1, `resto 1..7`, `sub-bloque con el color de su celda`. ✓
